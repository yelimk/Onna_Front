import { apiRequest } from '@/api/client';
import type { Achievements, Me, MyPost } from '@/types/api';

/** 내 정보. onboarded가 false면 취향 설문으로 보낸다. */
export function getMe() {
  return apiRequest<Me>('/users/me');
}

/** 선호 태그를 통째로 바꿔 저장한다. 저장하면 onboarded가 true가 된다. 빈 목록은 INVALID_INPUT */
export function saveMyTags(tagIds: number[]) {
  return apiRequest<void>('/users/me/tags', { method: 'PUT', body: { tagIds } });
}

/** 내가 남긴 기록 (최신순). zoneId를 주면 그 구역 것만 */
export function getMyPosts(zoneId?: number) {
  return apiRequest<MyPost[]>('/users/me/posts', { query: { zoneId } });
}

/** 연 자리 수, 발견한 구역 수, 처음 연 자리 수 */
export function getMyAchievements() {
  return apiRequest<Achievements>('/users/me/achievements');
}
