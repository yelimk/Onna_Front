import type { ClusterMarker, HomeMapMarker, PhotoMarker } from '@/features/map/types/home-map-marker';
import { fromServerCoordinate } from '@/features/map/utils/to-coordinate';
import type { PostPreview, Zone } from '@/types/api';
import { toHashtags } from '@/features/map/utils/to-hashtags';

/**
 * 서버의 사진 한 장 → 지도 기록. 자리는 사진마다 오는 좌표(일부러 흐린 좌표)를 쓴다.
 * 열렸는지와 얼마나 흐린지는 서버가 내 위치로 정한 stage를 그대로 따른다 (위치 없이 부르면 맛보기·내가 연 사진만 OPEN).
 */
export function toPhotoMarker(zone: Zone, preview: PostPreview): PhotoMarker {
  return {
    kind: 'photo',
    id: String(preview.postId),
    coordinate: fromServerCoordinate(preview),
    hashtags: toHashtags(preview.tags),
    isOpen: preview.stage === 'OPEN',
    serverDistanceMeters: preview.distanceM,
    imageUrl: preview.imageUrl,
    title: preview.title,
    placeName: zone.name,
  };
}

/** Figma '#단골자리 · 공강벤치'처럼 첫 태그에만 #을 붙인다. */
function joinTopTags(tags: string[]) {
  return toHashtags(tags)
    .map((hashtag, index) => (index === 0 ? hashtag : hashtag.slice(1)))
    .join(' · ');
}

function toClusterMarker(zone: Zone): ClusterMarker {
  return {
    kind: 'cluster',
    id: String(zone.zoneId),
    // 서버가 정한 묶음 마커 자리 (첫 대표 사진 좌표). 구역이 넓어도 마커 위에 서면 그 사진이 열린다.
    coordinate: fromServerCoordinate(zone),
    label: joinTopTags(zone.topTags),
    // 서버가 이름표에 못 넣은 나머지 태그 종류 수를 준다 ('+11개 더').
    moreCount: zone.moreTagCount,
    imageUrls: zone.previews.map(({ imageUrl }) => imageUrl),
  };
}

/**
 * 서버 구역 → 지도 홈 마커. 사진이 한 장인 구역은 사진 마커로, 여러 장이면 묶음 마커로 놓는다.
 * 사진이 없는 구역도 서버가 주지만, Figma 지도 홈에는 빈 구역 표시가 없어서 뺀다.
 */
export function toHomeMarkers(zones: Zone[]): HomeMapMarker[] {
  return zones.flatMap((zone): HomeMapMarker[] => {
    if (zone.postCount === 0 || zone.previews.length === 0) return [];
    if (zone.postCount === 1) return [toPhotoMarker(zone, zone.previews[0])];
    return [toClusterMarker(zone)];
  });
}

/**
 * 구역들의 대표 사진을 모두 기록 목록으로 편다. 검색·경로·사진 카드가 '지도에 남겨진 기록'으로 쓴다.
 * 구역마다 대표 사진만 오므로 전체 기록은 아니다. 묶음 안 기록은 묶음 목록에서 받는다.
 */
export function toPreviewRecords(zones: Zone[]): PhotoMarker[] {
  return zones.flatMap((zone) => zone.previews.map((preview) => toPhotoMarker(zone, preview)));
}
