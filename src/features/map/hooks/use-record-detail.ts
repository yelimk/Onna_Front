import { useEffect, useMemo } from 'react';

import { openRadiusMeters } from '@/features/map/constants/map-config';
import { useHomeMapMarkers } from '@/features/map/hooks/use-home-map-markers';
import { useLocationAccuracy } from '@/features/map/hooks/use-my-location';
import { openNearbyPost, useOpenedPost } from '@/features/map/hooks/use-opened-posts';
import { findZonePost } from '@/features/map/hooks/use-zone-posts';
import type { Coordinate } from '@/features/map/types/home-map-marker';
import { getDistanceMeters } from '@/features/map/utils/get-distance-meters';
import { formatHashtag } from '@/utils/format-hashtag';

/** 사진 카드에 필요한 기록 한 건 */
export type RecordDetail = {
  id: string;
  placeName: string;
  hashtags: string[];
  /** 서버가 열어 준 기록이면 남긴 사람의 한 줄, 아니면 빈 값 */
  comment: string;
  /** 열린 기록은 선명한 사진, 아니면 흐림 단계에 맞춰 흐린 사진. 없으면 회색 상자 */
  imageUrl?: string;
  /** 서버가 열어 준 기록이면 한 줄과 좋아요·남기기 버튼을 보여준다 */
  isUnlocked: boolean;
  isLiked: boolean;
  /** 지금 열림 반경 안이면 true */
  isNearby: boolean;
  /** 열지 못한 이유 (TOO_FAR 멀리 있음, RETRY_LOCATION 위치 부정확 등). 열렸거나 아직 안 물어봤으면 null */
  openErrorCode: string | null;
};

/**
 * 사진 카드의 기록 한 건. 지도 구역·묶음에서 받아 둔 흐린 기록을 먼저 보여주고,
 * 가까이 있으면 서버에 열어 달라고 해서(POST /posts/{id}/open) 선명한 사진·한 줄·좋아요 여부로 바꾼다.
 */
export function useRecordDetail(recordId: string, myLocation: Coordinate | null): RecordDetail | null {
  const { records } = useHomeMapMarkers(myLocation);
  const accuracy = useLocationAccuracy();
  const { opened, openErrorCode } = useOpenedPost(recordId);

  const found = useMemo(() => records.find(({ id }) => id === recordId) ?? findZonePost(recordId), [records, recordId]);
  const isNearby = found !== undefined && myLocation !== null && getDistanceMeters(myLocation, found.coordinate) <= openRadiusMeters;
  // 사진에는 좌표가 없어 구역 자리로 거리를 재므로, 서버가 이미 열림(OPEN)이라고 한 기록도 열어 본다.
  // 어디서 왔는지 모르는 기록(목록에 없음)은 서버가 판단하게 물어본다.
  const shouldTryOpen = !opened && myLocation !== null && (found === undefined || isNearby || found.isOpen);

  useEffect(() => {
    if (shouldTryOpen && myLocation) openNearbyPost(recordId, myLocation, accuracy);
  }, [shouldTryOpen, recordId, myLocation, accuracy]);

  if (!found && !opened) return null;
  return {
    id: recordId,
    placeName: opened?.zoneName ?? found?.placeName ?? '',
    hashtags: opened ? opened.tags.map(formatHashtag) : (found?.hashtags ?? []),
    comment: opened?.oneLine ?? '',
    imageUrl: opened?.imageUrl ?? found?.imageUrl,
    isUnlocked: opened !== null,
    isLiked: opened?.liked ?? false,
    isNearby,
    openErrorCode,
  };
}
