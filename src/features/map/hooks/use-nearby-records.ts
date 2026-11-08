import { useEffect, useMemo, useState } from 'react';

import { getMapZones, getZonePosts } from '@/api/map';
import { nearbyRecordRadiusMeters } from '@/features/map/constants/map-config';
import { useHomeMapMarkers } from '@/features/map/hooks/use-home-map-markers';
import type { Coordinate, PhotoMarker } from '@/features/map/types/home-map-marker';
import { rememberRecords } from '@/features/map/utils/known-records';
import { summarizeNearbyRecords } from '@/features/map/utils/summarize-nearby-records';
import { toServerCoordinate } from '@/features/map/utils/to-coordinate';
import { toPhotoMarker } from '@/features/map/utils/zones-to-markers';

/**
 * 고른 장소 둘레의 기록 전부를 서버에서 받는다.
 * 지도 홈이 가진 기록은 '내 위치' 둘레 구역의 대표 사진(구역마다 1~2장)뿐이라, 고른 장소가 멀거나 구역에 사진이 많으면 적게 센다.
 * 그래서 고른 장소를 중심으로 구역을 받고(기본 반경 500m라 300m 안 기록이 든 구역은 다 들어온다), 사진이 있는 구역마다 사진 목록을 받는다.
 * 세는 데는 흐림 단계가 필요 없어서 내 위치 없이 묻는다. 걸을 때마다 다시 묻지 않게 하려는 것이다.
 */
async function loadRecordsAround(center: Coordinate) {
  const zones = await getMapZones(null, { center: toServerCoordinate(center) });
  const lists = await Promise.all(
    zones
      .filter((zone) => zone.postCount > 0)
      .map((zone) =>
        getZonePosts(zone.zoneId, null)
          .then((posts) => posts.map((post) => toPhotoMarker(zone, post)))
          // 한 구역이 실패해도 대표 사진만큼은 센다.
          .catch(() => zone.previews.map((preview) => toPhotoMarker(zone, preview))),
      ),
  );
  return lists.flat();
}

const toKey = (center: Coordinate | null) => (center ? `${center.latitude},${center.longitude}` : null);

/**
 * 고른 장소 근처(300m)에 남겨진 기록 수, 많이 붙은 해시태그, 대표 기록.
 * 서버에서 받기 전이나 받지 못하면 지도 홈이 가진 기록으로 대신 센다.
 * 같은 기록을 지도 홈도 갖고 있으면 그쪽(내 위치 기준 흐림 단계)의 사진을 쓴다.
 */
export function useNearbyRecords(center: Coordinate | null, myLocation: Coordinate | null) {
  const { records: homeRecords } = useHomeMapMarkers(myLocation);
  const centerKey = toKey(center);
  const [fetched, setFetched] = useState<{ key: string; records: PhotoMarker[] } | null>(null);

  useEffect(() => {
    if (!centerKey) return;
    const [latitude, longitude] = centerKey.split(',').map(Number);
    let isStale = false;
    loadRecordsAround({ latitude, longitude })
      .then((records) => {
        // 사진 카드·길안내가 이 기록들을 다시 찾을 수 있게 기억해 둔다.
        rememberRecords(records);
        if (!isStale) setFetched({ key: centerKey, records });
      })
      .catch(() => {});
    return () => {
      isStale = true;
    };
  }, [centerKey]);

  return useMemo(() => {
    if (!center) return { recordCount: 0, hashtags: [], representative: null };
    const serverRecords = fetched?.key === centerKey ? fetched.records : null;
    const records = serverRecords
      ? serverRecords.map((record) => homeRecords.find(({ id }) => id === record.id) ?? record)
      : homeRecords;
    return summarizeNearbyRecords(records, center, nearbyRecordRadiusMeters);
  }, [center, centerKey, fetched, homeRecords]);
}
