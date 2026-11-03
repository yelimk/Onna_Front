import { useSyncExternalStore } from 'react';

import { mockLikedSpots } from '@/mock/my-activity';

/*
 * 좋아요 내역 목록과 상세 화면이 같은 좋아요 상태를 보게 하는 곳.
 * 상세에서 취소하고 목록으로 돌아와도 목록의 하트가 같이 빈 하트가 된다.
 * 좋아요 API가 진짜가 되면, 여기서 하트를 바꾸는 순간 서버에도 보내고 실패하면 되돌린다.
 */
let likedIds: string[] = mockLikedSpots.map((spot) => spot.spotId);
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function toggleSpotLike(spotId: string) {
  likedIds = likedIds.includes(spotId) ? likedIds.filter((id) => id !== spotId) : [...likedIds, spotId];
  listeners.forEach((listener) => listener());
}

/** 지금 좋아요 중인 자리 id 목록 */
export function useLikedSpotIds() {
  return useSyncExternalStore(subscribe, () => likedIds);
}
