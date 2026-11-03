import { useEffect, useMemo } from 'react';

import { openRadiusMeters } from '@/features/map/constants/map-config';
import { useHomeMapMarkers } from '@/features/map/hooks/use-home-map-markers';
import { unlockRecord, useLikedRecordIds, useUnlockedRecordIds } from '@/features/map/hooks/use-record-memory';
import { findZonePost } from '@/features/map/hooks/use-zone-posts';
import type { Coordinate } from '@/features/map/types/home-map-marker';
import { getDistanceMeters } from '@/features/map/utils/get-distance-meters';

/** 사진 카드에 필요한 기록 한 건 */
export type RecordDetail = {
  id: string;
  placeName: string;
  hashtags: string[];
  comment: string;
  /** 다가가서 열었거나 지금 열림 반경 안이면 한 줄과 버튼을 보여준다 */
  isUnlocked: boolean;
  isLiked: boolean;
  /** 지금 열림 반경 안이면 true */
  isNearby: boolean;
};

/**
 * 기록 한 건을 찾는다. 지도 구역의 대표 사진과, 묶음 목록에서 받아 둔 기록에서 찾는다.
 * 한 줄(comment)은 열어야 서버가 주므로, '사진 열기' API를 붙이면 그 응답으로 채운다.
 */
export function useRecordDetail(recordId: string, myLocation: Coordinate | null): RecordDetail | null {
  const { records } = useHomeMapMarkers(myLocation);
  const unlockedIds = useUnlockedRecordIds();
  const likedIds = useLikedRecordIds();

  const detail = useMemo(() => {
    const found = records.find(({ id }) => id === recordId) ?? findZonePost(recordId);
    if (!found) return null;

    const isNearby = myLocation !== null && getDistanceMeters(myLocation, found.coordinate) <= openRadiusMeters;
    return {
      id: recordId,
      placeName: found.placeName ?? '',
      hashtags: found.hashtags,
      comment: found.comment ?? '',
      isNearby,
      isUnlocked: isNearby || unlockedIds.includes(recordId),
      isLiked: likedIds.includes(recordId),
    };
  }, [records, recordId, myLocation, unlockedIds, likedIds]);

  // 가까이 와서 열린 기록은 멀어져도 다시 잠기지 않게 이 폰에 기억해 둔다.
  const shouldRemember = detail?.isNearby === true && !unlockedIds.includes(recordId);
  useEffect(() => {
    if (shouldRemember) unlockRecord(recordId);
  }, [shouldRemember, recordId]);

  return detail;
}
