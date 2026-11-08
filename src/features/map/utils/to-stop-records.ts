import type { PhotoMarker } from '@/features/map/types/home-map-marker';
import { findKnownRecord } from '@/features/map/utils/known-records';
import { fromServerCoordinate } from '@/features/map/utils/to-coordinate';
import type { RouteRecommendation } from '@/types/api';
import { toHashtags } from '@/features/map/utils/to-hashtags';

/** 서버 경로 추천이 고른 자리 → 지도 기록. 사진은 지도·묶음에서 이미 받은 기록이면 덧붙인다. */
export function toStopRecords({ stops }: RouteRecommendation): PhotoMarker[] {
  return stops.map((stop) => {
    const id = String(stop.postId);
    const known = findKnownRecord(id);
    return {
      kind: 'photo',
      id,
      coordinate: fromServerCoordinate(stop),
      hashtags: toHashtags(stop.tags),
      isOpen: known?.isOpen ?? false,
      imageUrl: known?.imageUrl,
      title: stop.title,
      placeName: stop.zoneName ?? known?.placeName,
    };
  });
}
