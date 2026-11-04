import { useEffect, useMemo, useState } from 'react';

import { getRouteRecommendation } from '@/api/map';
import { getWalkRoute } from '@/features/map/api/get-walk-route';
import {
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
import { findKnownRecord, rememberRecords } from '@/features/map/utils/known-records';
import { pickRouteStops } from '@/features/map/utils/pick-route-stops';
import { fromServerCoordinate, toServerCoordinate } from '@/features/map/utils/to-coordinate';
import type { RouteRecommendation } from '@/types/api';

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

/** 목적지까지 걷는 데 드는 대략의 시간(분). 서버는 목적지를 받지 않아서, 이 시간 동안 걸을 만한 자리를 추천받는다. */
function estimateWalkMinutes({ start, destination }: WalkRoutePlan) {
  const seconds = (getDistanceMeters(start, destination) * routeDetourFactor) / walkingSpeedMetersPerSecond;
  return Math.max(minRouteMinutes, Math.ceil(seconds / 60));
}

/** 서버가 고른 자리 → 지도 기록. 지도·묶음에서 이미 받은 기록이면 해시태그·사진을 덧붙인다. */
function toStopRecords({ stops }: RouteRecommendation): PhotoMarker[] {
  return stops.map((stop) => {
    const id = String(stop.postId);
    const coordinate = fromServerCoordinate(stop);
    const known = findKnownRecord(id);
    return known ? { ...known, coordinate } : { kind: 'photo', id, coordinate, hashtags: [], isOpen: false };
  });
}

/** null: 서버 추천을 받지 못함(앱 규칙으로 대신 고른다). undefined: 아직 받는 중 */
type Candidates = PhotoMarker[] | null | undefined;

/**
 * 계획으로 들를 자리를 고르고, 그 자리를 지나는 걷는 길(TMAP)을 받는다. 계획이 없으면 아무것도 하지 않는다.
 * 들를 자리 후보는 서버 AI 추천(GET /recommendations/route)이 주고, 그중 목적지 가는 길에 있는 것만 앱이 남긴다.
 * 서버가 목적지를 받지 않아서, 추천 자리가 가는 길에서 벗어날 수 있기 때문이다.
 * 추천을 받지 못하면 지도 기록에서 고른 해시태그가 붙은 자리로 대신 고른다.
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
    getRouteRecommendation(toServerCoordinate(plan.start), estimateWalkMinutes(plan))
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
    return pickRouteStops({
      records: candidates ?? records,
      start: plan.start,
      destination: plan.destination,
      // 서버 추천은 이미 내 취향으로 고른 자리라 해시태그로 다시 거르지 않는다 (추천 자리에는 해시태그도 없다).
      hashtags: candidates ? [] : plan.hashtags,
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
