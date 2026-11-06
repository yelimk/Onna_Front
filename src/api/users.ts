import { apiRequest } from '@/api/client';
import type { Achievements, AppNotification, LikedSpot, Me, MyPost, OpenedSpot, Tag } from '@/types/api';

/** 내 정보. onboarded가 false면 취향 설문으로 보낸다. */
export function getMe() {
  return apiRequest<Me>('/users/me');
}

/**
 * 회원 탈퇴. 성공하면 204. 탈퇴하면 남긴 기록은 지도·검색에서 모두 사라지고, 같은 이메일로 다시 가입할 수 있다.
 * 출입증이 이미 만료돼 다시 받을 수도 없으면 401이다 (백엔드 11월 답변).
 */
export function deleteMe() {
  return apiRequest<void>('/users/me', { method: 'DELETE' });
}

/** 지금 고른 선호 태그. 온보딩 전이면 빈 목록 */
export function getMyTags() {
  return apiRequest<Tag[]>('/users/me/tags');
}

/** 선호 태그를 통째로 바꿔 저장한다. 저장하면 onboarded가 true가 된다. 서로 다른 태그가 3개 미만이면 INVALID_INPUT */
export function saveMyTags(tagIds: number[]) {
  return apiRequest<void>('/users/me/tags', { method: 'PUT', body: { tagIds } });
}

/** 내가 남긴 기록 (최신순). zoneId를 주면 그 구역 것만 */
export function getMyPosts(zoneId?: number) {
  return apiRequest<MyPost[]>('/users/me/posts', { query: { zoneId } });
}

/** 남긴 자리·연 자리·좋아한 자리 수와 배지 */
export function getMyAchievements() {
  return apiRequest<Achievements>('/users/me/achievements');
}

/** 연 자리 기록 (최근에 연 순서) */
export function getMyOpens() {
  return apiRequest<OpenedSpot[]>('/users/me/opens');
}

/** 알림 목록 (최근 순, 최대 50개). 푸시 없이 이 목록으로만 본다 */
export function getMyNotifications() {
  return apiRequest<AppNotification[]>('/users/me/notifications');
}

/** 좋아요 내역 (최근에 누른 순서). 나만 볼 수 있다 */
export function getMyLikes() {
  return apiRequest<LikedSpot[]>('/users/me/likes');
}
