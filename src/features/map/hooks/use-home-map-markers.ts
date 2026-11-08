import { useMemo } from 'react';

import { defaultMapCenter } from '@/features/map/constants/map-config';
import { useMapZones } from '@/features/map/hooks/use-map-zones';
import { useLocationAccuracy } from '@/features/map/hooks/use-my-location';
import { useOpenedPosts } from '@/features/map/hooks/use-opened-posts';
import type { Coordinate, HomeMapMarker, PhotoMarker } from '@/features/map/types/home-map-marker';
import { findNearestPhoto } from '@/features/map/utils/home-map-markers';
import { toHomeMarkers, toPreviewRecords } from '@/features/map/utils/zones-to-markers';
import type { OpenedPost } from '@/types/api';

function withOpened<Marker extends HomeMapMarker | PhotoMarker>(marker: Marker, openedPosts: ReadonlyMap<string, OpenedPost>): Marker {
  if (marker.kind !== 'photo') return marker;
  const opened = openedPosts.get(marker.id);
  return opened ? { ...marker, isOpen: true, imageUrl: opened.imageUrl } : marker;
}

/**
 * 지도 홈에 올릴 마커와 가장 가까운 기록. 서버 구역(GET /map/zones)에서 만든다.
 * - markers: 지도 마커. 사진이 열렸는지(isOpen)는 서버가 내 위치로 정한 흐림 단계를 따른다.
 * - records: 구역들의 대표 사진. 검색·경로·사진 카드가 '지도에 남겨진 기록'으로 쓴다.
 *   구역을 다시 받을 때만 바뀌어서, 걸을 때마다 경로·검색을 다시 계산하지 않는다.
 * - zones: 서버 구역 그대로. 묶음 화면이 구역 이름·좌표를 볼 때 쓴다.
 * - errorCode: 구역을 받지 못한 이유 (로그인 안 함, 인터넷 끊김 등)
 */
export function useHomeMapMarkers(myLocation: Coordinate | null) {
  const accuracy = useLocationAccuracy();
  const { zones, errorCode } = useMapZones(myLocation, accuracy);

  const openedPosts = useOpenedPosts();
  // 이미 연 사진은 서버가 다음에 OPEN으로 주기 전에도 열린 모습(선명한 사진)으로 바꿔 둔다.
  const markers = useMemo(() => toHomeMarkers(zones).map((marker) => withOpened(marker, openedPosts)), [zones, openedPosts]);
  const records = useMemo(() => toPreviewRecords(zones).map((record) => withOpened(record, openedPosts)), [zones, openedPosts]);
  const nearestPhoto = useMemo(
    () => findNearestPhoto(markers, myLocation ?? defaultMapCenter),
    [markers, myLocation],
  );

  return { markers, records, nearestPhoto, zones, errorCode };
}
