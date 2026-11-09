import { useMemo } from 'react';

import { defaultMapCenter } from '@/features/map/constants/map-config';
import { useMapZones } from '@/features/map/hooks/use-map-zones';
import { useLocationAccuracy } from '@/features/map/hooks/use-my-location';
import { useOpenedPosts } from '@/features/map/hooks/use-opened-posts';
import type { Coordinate } from '@/features/map/types/home-map-marker';
import { findNearestPhoto } from '@/features/map/utils/home-map-markers';
import { toHomeMarkers, toOutsidePhotoMarker, toPreviewRecords } from '@/features/map/utils/zones-to-markers';
import type { OpenedPost, PostPreview, Zone } from '@/types/api';

/**
 * 이미 연 사진은 서버가 다음에 OPEN으로 주기 전에도 열린 모습(선명한 사진)으로 바꿔 둔다.
 * 지도 구역은 30m 걷거나 25분이 지나야 다시 받아서, 이게 없으면 연 사진이 지도에선 한동안 흐리게 남는다.
 * 마커로 바꾸기 전 구역의 대표 사진을 바꿔서, 사진 한 장 마커와 묶음 마커(겹친 대표 사진)가 같이 바뀐다.
 */
function withOpenedPreviews(zones: Zone[], openedPosts: ReadonlyMap<string, OpenedPost>): Zone[] {
  if (openedPosts.size === 0) return zones;
  return zones.map((zone) => {
    if (!zone.previews.some(({ postId }) => openedPosts.has(String(postId)))) return zone;
    return { ...zone, previews: withOpened(zone.previews, openedPosts) };
  });
}

function withOpened(previews: PostPreview[], openedPosts: ReadonlyMap<string, OpenedPost>) {
  if (openedPosts.size === 0) return previews;
  return previews.map((preview) => {
    const opened = openedPosts.get(String(preview.postId));
    return opened ? { ...preview, stage: 'OPEN' as const, imageUrl: opened.imageUrl, liked: opened.liked } : preview;
  });
}

/**
 * 지도 홈에 올릴 마커와 가장 가까운 기록. 서버 구역(GET /map/zones)과 구역 밖 사진(GET /map/outside-posts)에서 만든다.
 * 구역 밖 사진은 묶음이 없어서 사진마다 사진 한 장 마커로 올린다.
 * - markers: 지도 마커. 사진이 열렸는지(isOpen)는 서버가 내 위치로 정한 흐림 단계를 따르고, 앱에서 연 사진은 바로 열린 모습이다.
 * - records: 구역들의 대표 사진. 검색·경로·사진 카드가 '지도에 남겨진 기록'으로 쓴다.
 *   구역을 다시 받거나 사진을 열 때만 바뀌어서, 걸을 때마다 경로·검색을 다시 계산하지 않는다.
 * - zones: 서버 구역 그대로. 묶음 화면이 구역 이름·좌표를 볼 때 쓴다.
 * - errorCode: 구역을 받지 못한 이유 (로그인 안 함, 인터넷 끊김 등)
 */
export function useHomeMapMarkers(myLocation: Coordinate | null) {
  const accuracy = useLocationAccuracy();
  const { zones, outsidePosts, errorCode } = useMapZones(myLocation, accuracy);
  const openedPosts = useOpenedPosts();

  const shownZones = useMemo(() => withOpenedPreviews(zones, openedPosts), [zones, openedPosts]);
  const outsideRecords = useMemo(
    () => withOpened(outsidePosts, openedPosts).map(toOutsidePhotoMarker),
    [outsidePosts, openedPosts],
  );
  const markers = useMemo(() => [...toHomeMarkers(shownZones), ...outsideRecords], [shownZones, outsideRecords]);
  const records = useMemo(() => [...toPreviewRecords(shownZones), ...outsideRecords], [shownZones, outsideRecords]);
  const nearestPhoto = useMemo(
    () => findNearestPhoto(records, myLocation ?? defaultMapCenter),
    [records, myLocation],
  );

  return { markers, records, nearestPhoto, zones, errorCode };
}
