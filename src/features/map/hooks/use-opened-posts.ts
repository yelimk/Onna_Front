import { useSyncExternalStore } from 'react';

import { isApiError } from '@/api/api-error';
import { likePost, openPost, unlikePost } from '@/api/map';
import { showToast } from '@/components/toast';
import { browsingAccuracyMeters, zonesRefreshMs } from '@/features/map/constants/map-config';
import type { Coordinate } from '@/features/map/types/home-map-marker';
import { toServerCoordinate } from '@/features/map/utils/to-coordinate';
import type { OpenedPost } from '@/types/api';

/*
 * 연 기록(POST /posts/{id}/open의 응답)을 앱이 켜져 있는 동안 기억한다.
 * 길안내 도착 화면에서 연 기록을 사진 카드가 다시 열지 않고 바로 보여주고,
 * 좋아요를 누른 결과가 다른 화면에도 똑같이 보이게 하려고 한곳에 둔다.
 */
type PostState = {
  post: OpenedPost | null;
  openedAt: number;
  /** 마지막으로 열지 못한 이유 (TOO_FAR, RETRY_LOCATION 등) */
  errorCode: string | null;
};

const emptyState: PostState = { post: null, openedAt: 0, errorCode: null };
// 기록마다 상태를 통째로 새 객체로 바꿔 끼운다. 화면은 자기 기록의 상태 객체가 바뀌었을 때만 다시 그린다.
const postStates = new Map<string, PostState>();
/** 지금 서버에 열어 달라고 묻는 중인 기록. 같은 기록을 동시에 두 번 묻지 않는다. */
const opening = new Set<string>();
const listeners = new Set<() => void>();

const getState = (postId: string) => postStates.get(postId) ?? emptyState;

function updateState(postId: string, change: Partial<PostState>) {
  postStates.set(postId, { ...getState(postId), ...change });
  listeners.forEach((listener) => listener());
}

/** 사진 주소가 만료되기 전이면 다시 묻지 않는다 (지도 구역과 같은 4분). */
const isFresh = ({ post, openedAt }: PostState) => post !== null && Date.now() - openedAt < zonesRefreshMs;

/**
 * 기록을 연다. 서버가 내 위치로 가까운지 본다: 멀면 TOO_FAR, 위치가 부정확하면(오차 50m 넘음) RETRY_LOCATION.
 * 실패해도 던지지 않고 이유만 남긴다. 화면은 잠긴 모습으로 두고, 위치가 바뀌면 다시 시도한다.
 */
export async function openNearbyPost(postId: string, myLocation: Coordinate, accuracy: number | null) {
  if (opening.has(postId) || isFresh(getState(postId))) return;
  opening.add(postId);
  try {
    // 오차를 모르면 정확하다고 속이지 않도록 아주 부정확한 값을 보낸다. 서버는 RETRY_LOCATION으로 거절하고, 다음 위치 때 다시 묻는다.
    const post = await openPost(Number(postId), {
      ...toServerCoordinate(myLocation),
      accuracy: accuracy ?? browsingAccuracyMeters,
    });
    updateState(postId, { post, openedAt: Date.now(), errorCode: null });
  } catch (error) {
    // 예전에 연 사진은 그대로 두고 이유만 남긴다. 멀어져도 이번에 앱을 켠 동안에는 열린 채로 보인다.
    updateState(postId, { errorCode: isApiError(error) ? error.code : 'UNKNOWN' });
  } finally {
    opening.delete(postId);
  }
}

/**
 * 좋아요를 바꾼다. 누르자마자 화면을 바꾸고(기다리지 않게), 서버가 거절하면 되돌린 뒤 토스트로 알린다.
 * 열어 본 기록만 좋아요할 수 있다 (아니면 NOT_OPENED).
 */
export async function toggleLike(postId: string) {
  const { post } = getState(postId);
  if (!post) return;
  const nextLiked = !post.liked;
  const setLiked = (liked: boolean) => {
    const current = getState(postId).post;
    if (current) updateState(postId, { post: { ...current, liked } });
  };

  setLiked(nextLiked);
  try {
    await (nextLiked ? likePost(Number(postId)) : unlikePost(Number(postId)));
  } catch (error) {
    setLiked(!nextLiked);
    showToast(isApiError(error, 'NOT_OPENED') ? '열어 본 사진만 좋아요할 수 있어요' : '좋아요를 바꾸지 못했어요', 'error');
  }
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** 연 기록 한 건과, 열지 못했다면 그 이유. 열거나 좋아요가 바뀔 때마다 다시 그린다. */
export function useOpenedPost(postId: string) {
  const { post, errorCode } = useSyncExternalStore(
    subscribe,
    () => getState(postId),
    () => getState(postId),
  );
  return { opened: post, openErrorCode: errorCode };
}
