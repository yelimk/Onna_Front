import { useEffect, useMemo, useState } from 'react';

import { getRouteRecommendation } from '@/api/map';
import { getTags } from '@/api/tags';
import { getWalkRoute } from '@/features/map/api/get-walk-route';
import {
  maxRouteMinutes,
  maxRouteStops,
  minRouteMinutes,
  routeCorridorMeters,
  routeDetourFactor,
  walkingSpeedMetersPerSecond,
} from '@/features/map/constants/map-config';
import { useHomeMapMarkers } from '@/features/map/hooks/use-home-map-markers';
import type { Coordinate, PhotoMarker } from '@/features/map/types/home-map-marker';
import type { WalkRoute } from '@/features/map/types/walk-route';
import { getDistanceMeters } from '@/features/map/utils/get-distance-meters';
import { rememberRecords } from '@/features/map/utils/known-records';
import { pickRouteStops } from '@/features/map/utils/pick-route-stops';
import { toServerCoordinate } from '@/features/map/utils/to-coordinate';
import { toStopRecords } from '@/features/map/utils/to-stop-records';
import type { Tag } from '@/types/api';
import { formatHashtag } from '@/utils/format-hashtag';

/**
 * '경로 추천'을 누른 순간의 계획. 출발점을 그때 위치로 고정한다.
 * 걸을 때마다 출발점이 바뀌면 경로를 계속 다시 받아서 지도가 흔들린다.
 */
export type WalkRoutePlan = {
  start: Coordinate;
  destination: Coordinate;
  destinationName: string;
  hashtags: string[];
};

/** 목적지까지 걷는 데 드는 대략의 시간(분). 서버가 이 시간 안에 들를 만한 자리를 고르도록 같이 보낸다. */
function estimateWalkMinutes({ start, destination }: WalkRoutePlan) {
  const seconds = (getDistanceMeters(start, destination) * routeDetourFactor) / walkingSpeedMetersPerSecond;
  return Math.min(maxRouteMinutes, Math.max(minRouteMinutes, Math.ceil(seconds / 60)));
}

// 태그 사전은 바뀌지 않으므로 앱이 켜져 있는 동안 한 번만 받는다. 못 받으면 해시태그 없이 추천받는다.
let tagDictionary: Promise<Tag[]> | null = null;
const loadTagDictionary = () => {
  tagDictionary ??= getTags().catch(() => {
    tagDictionary = null;
    return [];
  });
  return tagDictionary;
};

/**
 * 고른 해시태그('#덤') → 서버로 보낼 태그 id와 이름. 서버는 둘 중 하나라도 맞으면 그 해시태그로 본다.
 * - 이름: AI가 만든 해시태그는 태그 사전에 없어 id를 모르므로 이름으로 보낸다.
 * - id: 화면 해시태그는 띄어쓰기를 지운 모양('#말없이챙겨준사람')이라 이름이 서버 태그와 다를 수 있어서,
 *   태그 사전에 있는 것은 id로도 같이 보낸다.
 */
async function toRouteTags(hashtags: string[]) {
  if (hashtags.length === 0) return { tagIds: [], tags: [] };
  const dictionary = await loadTagDictionary();
  return {
    tagIds: dictionary.filter((tag) => hashtags.includes(formatHashtag(tag.name))).map(({ id }) => id),
    tags: hashtags.map((hashtag) => hashtag.replace(/^#+/, '')),
  };
}

/** null: 서버 추천을 받지 못함(앱 규칙으로 대신 고른다). undefined: 아직 받는 중 */
type Candidates = PhotoMarker[] | null | undefined;

/**
 * 계획으로 들를 자리를 고르고, 그 자리를 지나는 걷는 길(TMAP)을 받는다. 계획이 없으면 아무것도 하지 않는다.
 * 들를 자리는 서버 AI 추천(GET /recommendations/route)에 목적지·고른 해시태그를 보내 받은 순서(걸어가며 만나는 순서) 그대로 쓴다.
 * 추천을 받지 못하면 지도 기록에서 고른 해시태그가 붙은, 가는 길의 자리로 대신 고른다.
 */
export function useWalkRoute(plan: WalkRoutePlan | null, myLocation: Coordinate | null) {
  const { records } = useHomeMapMarkers(myLocation);
  const [recommendation, setRecommendation] = useState<{ plan: WalkRoutePlan; candidates: PhotoMarker[] | null } | null>(
    null,
  );
  const [result, setResult] = useState<{ plan: WalkRoutePlan; route: WalkRoute } | null>(null);

  useEffect(() => {
    if (!plan) return;
    let isStale = false;
    toRouteTags(plan.hashtags)
      .then(({ tagIds, tags }) =>
        getRouteRecommendation(toServerCoordinate(plan.start), {
          minutes: estimateWalkMinutes(plan),
          destination: toServerCoordinate(plan.destination),
          tagIds,
          tags,
        }),
      )
      .then((response) => {
        const candidates = toStopRecords(response);
        // 길안내 화면이 들를 자리의 자리·해시태그를 다시 찾을 수 있게 기억해 둔다.
        rememberRecords(candidates);
        if (!isStale) setRecommendation({ plan, candidates });
      })
      .catch(() => {
        if (!isStale) setRecommendation({ plan, candidates: null });
      });
    return () => {
      isStale = true;
    };
  }, [plan]);

  const candidates: Candidates = recommendation?.plan === plan ? recommendation.candidates : undefined;

  const stops = useMemo(() => {
    if (!plan || candidates === undefined) return [];
    // 서버는 목적지·해시태그를 받아 가는 길의 자리를 이미 골라 준다. 경로 카드가 넘치지 않게 개수만 맞춘다.
    if (candidates) return candidates.slice(0, maxRouteStops);
    return pickRouteStops({
      records,
      start: plan.start,
      destination: plan.destination,
      hashtags: plan.hashtags,
      corridorMeters: routeCorridorMeters,
      maxStops: maxRouteStops,
    });
  }, [plan, candidates, records]);

  const isPicking = plan !== null && candidates === undefined;

  useEffect(() => {
    if (!plan || isPicking) return;
    const controller = new AbortController();
    getWalkRoute({ ...plan, stops }, controller.signal)
      .then((route) => setResult({ plan, route }))
      .catch(() => {});
    return () => controller.abort();
  }, [plan, stops, isPicking]);

  // 앞 계획의 경로가 남아 있으면 보여주지 않는다.
  const route = result && result.plan === plan ? result.route : null;
  return { stops, route, isLoading: plan !== null && route === null };
}
