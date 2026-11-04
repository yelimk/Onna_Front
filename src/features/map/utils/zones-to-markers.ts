import type { ClusterMarker, HomeMapMarker, PhotoMarker } from '@/features/map/types/home-map-marker';
import { fromServerCoordinate } from '@/features/map/utils/to-coordinate';
import type { PostPreview, Zone } from '@/types/api';
import { formatHashtag } from '@/utils/format-hashtag';

export type MarkerOptions = {
  /**
   * 내 위치로 받은 구역인지. 위치 없이 둘러볼 때는 캠퍼스 가운데 기준으로 받은 흐림 단계라서 믿지 않고,
   * 맛보기 사진만 보여준다 (위치 안내 카드의 '둘러보기에서는 맛보기 사진과 해시태그만 보여요').
   */
  isNearMe: boolean;
};

/** 서버의 사진 한 장 → 지도 기록. 사진에는 좌표가 없어서, 그 사진이 속한 구역 자리에 놓는다. */
export function toPhotoMarker(zone: Zone, preview: PostPreview, { isNearMe }: MarkerOptions): PhotoMarker {
  const canShow = isNearMe || preview.isTeaser;
  return {
    kind: 'photo',
    id: String(preview.postId),
    coordinate: fromServerCoordinate(zone),
    hashtags: preview.tags.map(formatHashtag),
    isOpen: canShow && preview.stage === 'OPEN',
    imageUrl: canShow ? preview.imageUrl : undefined,
    placeName: zone.name,
  };
}

/** Figma '#단골자리 · 공강벤치'처럼 첫 태그에만 #을 붙인다. */
function joinTopTags(tags: string[]) {
  return tags.map((tag, index) => (index === 0 ? formatHashtag(tag) : formatHashtag(tag).slice(1))).join(' · ');
}

function toClusterMarker(zone: Zone, options: MarkerOptions): ClusterMarker {
  return {
    kind: 'cluster',
    id: String(zone.zoneId),
    coordinate: fromServerCoordinate(zone),
    label: joinTopTags(zone.topTags),
    // 서버가 이름표에 못 넣은 나머지 태그 종류 수를 준다 ('+11개 더').
    moreCount: zone.moreTagCount,
    imageUrls: zone.previews.flatMap((preview) => toPhotoMarker(zone, preview, options).imageUrl ?? []),
  };
}

/**
 * 서버 구역 → 지도 홈 마커. 사진이 한 장인 구역은 사진 마커로, 여러 장이면 묶음 마커로 놓는다.
 * 사진이 없는 구역도 서버가 주지만, Figma 지도 홈에는 빈 구역 표시가 없어서 뺀다.
 */
export function toHomeMarkers(zones: Zone[], options: MarkerOptions): HomeMapMarker[] {
  return zones.flatMap((zone): HomeMapMarker[] => {
    if (zone.postCount === 0 || zone.previews.length === 0) return [];
    if (zone.postCount === 1) return [toPhotoMarker(zone, zone.previews[0], options)];
    return [toClusterMarker(zone, options)];
  });
}

/**
 * 구역들의 대표 사진을 모두 기록 목록으로 편다. 검색·경로·사진 카드가 '지도에 남겨진 기록'으로 쓴다.
 * 구역마다 대표 사진만 오므로 전체 기록은 아니다. 각 기능이 전용 API로 바뀌면 그쪽 목록을 쓴다.
 */
export function toPreviewRecords(zones: Zone[], options: MarkerOptions): PhotoMarker[] {
  return zones.flatMap((zone) => zone.previews.map((preview) => toPhotoMarker(zone, preview, options)));
}
