import { apiRequest } from '@/api/client';
import type {
  Coordinate,
  HashtagSearchResult,
  MyLocation,
  OpenedPost,
  PostPreview,
  RouteRecommendation,
  Zone,
} from '@/types/api';

/**
 * 지도 화면용 서버 요청 (지도 담당이 features/map 화면에 붙인다).
 * 흐림 단계는 항상 '내 위치' 기준이라, 지도를 멀리 옮겨 봐도 거기 사진이 열리지는 않는다.
 */

type ZonesOptions = {
  /** 지도 중심. 없으면 내 위치 기준 */
  center?: Coordinate;
  /** 반경(m), 기본 500 */
  radius?: number;
};

/** 지도 홈: 구역별 묶음과 대표 흐린 사진. 사진 0개 구역도 온다. */
export function getMapZones(myLocation: MyLocation, { center, radius }: ZonesOptions = {}) {
  return apiRequest<Zone[]>('/map/zones', {
    query: { ...myLocation, centerLat: center?.lat, centerLng: center?.lng, radius },
  });
}

/** 묶음 안 사진 목록. sort 기본값은 서버의 'recommend'(추천순) */
export function getZonePosts(zoneId: number, myLocation: MyLocation, sort?: string) {
  return apiRequest<PostPreview[]>(`/zones/${zoneId}/posts`, { query: { ...myLocation, sort } });
}

/** 다가가서 열기. 멀면 TOO_FAR, 위치가 부정확하면 RETRY_LOCATION */
export function openPost(postId: number, myLocation: MyLocation) {
  return apiRequest<OpenedPost>(`/posts/${postId}/open`, { method: 'POST', body: myLocation });
}

/** 좋아요. 열어 본 사진만 가능하고, 아니면 NOT_OPENED */
export function likePost(postId: number) {
  return apiRequest<void>(`/posts/${postId}/likes`, { method: 'POST' });
}

export function unlikePost(postId: number) {
  return apiRequest<void>(`/posts/${postId}/likes`, { method: 'DELETE' });
}

/** 해시태그 검색 (가까운 순) */
export function searchHashtags(keyword: string, from: Coordinate) {
  return apiRequest<HashtagSearchResult[]>('/search/hashtags', { query: { keyword, ...from } });
}

/** 산책 경로 추천. minutes 기본 20분 */
export function getRouteRecommendation(from: Coordinate, minutes?: number) {
  return apiRequest<RouteRecommendation>('/recommendations/route', { query: { ...from, minutes } });
}
