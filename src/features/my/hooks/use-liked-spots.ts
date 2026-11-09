import { useSyncExternalStore } from 'react';

import { likePost, unlikePost } from '@/api/map';
import { showApiError } from '@/utils/show-api-error';

/*
 * 좋아요 내역 목록과 상세 화면이 같은 좋아요 상태를 보게 하는 곳.
 * 상세에서 취소하고 목록으로 돌아와도 목록의 하트가 같이 빈 하트가 된다.
 * 하트는 누르는 순간 바꾸고 서버에 보낸다. 서버가 실패하면 되돌리고 토스트로 알린다.
 */
let likedIds: number[] = [];
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** 서버에서 받은 좋아요 목록으로 상태를 맞춘다 */
export function setLikedSpotIds(ids: number[]) {
  likedIds = ids;
  listeners.forEach((listener) => listener());
}

export async function toggleSpotLike(postId: number) {
  const wasLiked = likedIds.includes(postId);
  setLikedSpotIds(wasLiked ? likedIds.filter((id) => id !== postId) : [...likedIds, postId]);
  try {
    await (wasLiked ? unlikePost(postId) : likePost(postId));
  } catch (error) {
    setLikedSpotIds(wasLiked ? [...likedIds, postId] : likedIds.filter((id) => id !== postId));
    showApiError(error);
  }
}

/** 지금 좋아요 중인 자리 id 목록 */
export function useLikedSpotIds() {
  return useSyncExternalStore(subscribe, () => likedIds);
}
