import { useEffect, useMemo } from 'react';

import { openRadiusMeters } from '@/features/map/constants/map-config';
import { useHomeMapMarkers } from '@/features/map/hooks/use-home-map-markers';
import { useLocationAccuracy } from '@/features/map/hooks/use-my-location';
import { openNearbyPost, useOpenedPost } from '@/features/map/hooks/use-opened-posts';
import type { Coordinate } from '@/features/map/types/home-map-marker';
import { getDistanceMeters } from '@/features/map/utils/get-distance-meters';
import { findKnownRecord } from '@/features/map/utils/known-records';
import { toHashtags } from '@/features/map/utils/to-hashtags';

/** 사진 카드에 필요한 기록 한 건 */
export type RecordDetail = {
  id: string;
  /** 카드 맨 위 이름. 기록 제목, 없으면(제목 필수 전 기록) 장소 이름 */
  title: string;
  placeName: string;
  hashtags: string[];
  /** 서버가 열어 준 기록이면 남긴 사람의 한 줄, 아니면 빈 값 */
  comment: string;
  /** 열린 기록은 선명한 사진, 아니면 흐림 단계에 맞춰 흐린 사진. 없으면 회색 상자 */
  imageUrl?: string;
  /** 서버가 열어 준 기록이면 한 줄과 좋아요·남기기 버튼을 보여준다 */
  isUnlocked: boolean;
  isLiked: boolean;
  /** 내가 남긴 기록. 내 사진은 신고할 수 없고(서버 400), 좋아요는 남의 사진에 건네는 것이라 두 버튼을 숨긴다. */
  isMine: boolean;
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

  const found = useMemo(() => records.find(({ id }) => id === recordId) ?? findKnownRecord(recordId), [records, recordId]);
  // 서버도 사진의 흐린 좌표까지 거리로 열어 줄지 정해서, 앱이 잰 25m가 서버 기준과 같다.
  const isNearby = found !== undefined && myLocation !== null && getDistanceMeters(myLocation, found.coordinate) <= openRadiusMeters;
  // 가까우면 서버에 열어 달라고 한다. 서버가 이미 열림(OPEN: 25m 안, 맛보기, 예전에 연 사진)이라고 했거나
  // 어디서 왔는지 모르는 기록(목록에 없음)도 서버가 판단하게 물어본다.
  const shouldTryOpen = !opened && myLocation !== null && (found === undefined || isNearby || found.isOpen);

  useEffect(() => {
    if (shouldTryOpen && myLocation) openNearbyPost(recordId, myLocation, accuracy);
  }, [shouldTryOpen, recordId, myLocation, accuracy]);

  if (!found && !opened) return null;
  const placeName = opened?.zoneName ?? found?.placeName ?? '';
  // 내 기록은 한 줄·사진을 이미 받아 두어서, 위치를 몰라 서버에 열어 달라고 못 해도 열린 모습으로 보여준다.
  const isMine = found?.isMine === true;
  return {
    id: recordId,
    title: opened?.title || found?.title || placeName,
    placeName,
    hashtags: opened ? toHashtags(opened.tags) : (found?.hashtags ?? []),
    comment: opened?.oneLine ?? (isMine ? (found?.comment ?? '') : ''),
    imageUrl: opened?.imageUrl ?? found?.imageUrl,
    isUnlocked: opened !== null || isMine,
    isLiked: opened?.liked ?? false,
    isMine,
    isNearby,
    openErrorCode,
  };
}
