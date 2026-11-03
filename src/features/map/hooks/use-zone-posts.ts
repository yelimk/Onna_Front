import { useEffect, useMemo, useRef, useState } from 'react';

import { isApiError } from '@/api/api-error';
import { getZonePosts } from '@/api/map';
import {
  browsingAccuracyMeters,
  defaultMapCenter,
  zonesRefetchMeters,
  zonesRefreshMs,
} from '@/features/map/constants/map-config';
import { useLocationAccuracy } from '@/features/map/hooks/use-my-location';
import type { Coordinate } from '@/features/map/types/home-map-marker';
import { getDistanceMeters } from '@/features/map/utils/get-distance-meters';
import { rememberRecords } from '@/features/map/utils/known-records';
import { toServerCoordinate } from '@/features/map/utils/to-coordinate';
import { toPhotoMarker } from '@/features/map/utils/zones-to-markers';
import type { PostPreview, Zone } from '@/types/api';

/** 오래됐는지 보는 간격. 받은 지 zonesRefreshMs가 지났는지 이만큼마다 확인한다. */
const staleCheckMs = 30 * 1000;

type ZonePostsState = {
  /** 서버가 준 그대로. 아직 받는 중이면 null */
  previews: PostPreview[] | null;
  errorCode: string | null;
};

/**
 * 묶음 안 기록 목록(GET /zones/{zoneId}/posts). 서버가 AI 추천순으로 정렬해 준 순서 그대로 쓴다.
 * 흐림 단계가 내 위치로 정해지므로 지도 구역과 같은 기준(30m 걷기, 4분)으로 다시 받는다.
 */
export function useZonePosts(zone: Zone | undefined, myLocation: Coordinate | null, isNearMe: boolean) {
  const accuracy = useLocationAccuracy();
  const [{ previews, errorCode }, setState] = useState<ZonePostsState>({ previews: null, errorCode: null });
  const lastRequest = useRef<{ zoneId: number; at: number; origin: Coordinate | null } | null>(null);

  useEffect(() => {
    if (!zone) return;

    const fetchPosts = () => {
      lastRequest.current = { zoneId: zone.zoneId, at: Date.now(), origin: myLocation };
      const request = {
        ...toServerCoordinate(myLocation ?? defaultMapCenter),
        accuracy: myLocation ? (accuracy ?? browsingAccuracyMeters) : browsingAccuracyMeters,
      };
      getZonePosts(zone.zoneId, request)
        .then((result) => {
          // 위치가 바뀌어 효과가 다시 돌아도 같은 묶음이면 받은 목록을 쓴다. 다른 묶음으로 바뀌었을 때만 버린다.
          if (lastRequest.current?.zoneId === zone.zoneId) setState({ previews: result, errorCode: null });
        })
        .catch((error: unknown) => {
          // 다음 위치 갱신 때 다시 묻도록 기록을 지운다. 받아 둔 목록은 그대로 둔다.
          if (lastRequest.current?.zoneId !== zone.zoneId) return;
          lastRequest.current = null;
          setState((previous) => ({ ...previous, errorCode: isApiError(error) ? error.code : 'UNKNOWN' }));
        });
    };

    if (isStale(lastRequest.current, zone.zoneId, myLocation)) fetchPosts();
    // 가만히 있어 위치가 안 바뀌어도, 사진 주소가 만료되기 전에 다시 받는다.
    const timer = setInterval(() => {
      if (isStale(lastRequest.current, zone.zoneId, myLocation)) fetchPosts();
    }, staleCheckMs);
    return () => clearInterval(timer);
  }, [zone, myLocation, accuracy]);

  // 맛보기만 보여줄지(isNearMe)는 지도 구역을 다시 받으면 바뀔 수 있어서, 받은 값과 따로 그때그때 적용한다.
  const posts = useMemo(
    () => (zone && previews ? previews.map((preview) => toPhotoMarker(zone, preview, { isNearMe })) : null),
    [zone, previews, isNearMe],
  );

  useEffect(() => {
    // 목록에서 누른 기록의 사진 카드가 같은 기록을 다시 묻지 않고 바로 해시태그·사진을 보여주게 한다.
    if (posts) rememberRecords(posts);
  }, [posts]);

  return { posts, errorCode };
}

/** 다른 묶음이거나, 오래됐거나, 위치가 생기거나 없어졌거나, 꽤 걸었으면 다시 받는다 (지도 구역과 같은 기준). */
function isStale(last: { zoneId: number; at: number; origin: Coordinate | null } | null, zoneId: number, origin: Coordinate | null) {
  if (!last || last.zoneId !== zoneId) return true;
  if (Date.now() - last.at >= zonesRefreshMs) return true;
  if ((last.origin === null) !== (origin === null)) return true;
  return origin !== null && last.origin !== null && getDistanceMeters(origin, last.origin) >= zonesRefetchMeters;
}
