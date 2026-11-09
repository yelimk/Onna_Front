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
  /** 지도 중심. 없으면 내 위치 기준. 내 위치를 모르면(null) 꼭 보내야 한다. */
  center?: Coordinate;
  /** 반경(m), 기본 500 */
  radius?: number;
};

/**
 * 지도 홈: 구역별 묶음과 대표 흐린 사진. 사진 0개 구역도 온다.
 * 위치 권한이 없으면 myLocation을 null로 (lat·lng·accuracy를 셋 다 뺀다). 이때는 맛보기·내가 연 사진만 OPEN이다.
 */
export function getMapZones(myLocation: MyLocation | null, { center, radius }: ZonesOptions = {}) {
  return apiRequest<Zone[]>('/map/zones', {
    query: { ...myLocation, centerLat: center?.lat, centerLng: center?.lng, radius },
  });
}

/**
 * 지도: 영남대 구역 밖에 남긴 남의 사진 (구역 묶음에 들지 않아 사진마다 마커를 따로 띄운다).
 * 지도 중심 반경 안에서 가까운 순 최대 50장. 위치·중심·흐림 단계 규칙은 getMapZones와 같다. 맛보기(isTeaser)는 늘 false다.
 */
export function getOutsidePosts(myLocation: MyLocation | null, { center, radius }: ZonesOptions = {}) {
  return apiRequest<PostPreview[]>('/map/outside-posts', {
    query: { ...myLocation, centerLat: center?.lat, centerLng: center?.lng, radius },
  });
}

/** 묶음 안 사진 정렬: 추천순(기본), 좋아요 많은 순, 가까운 순(위치 없으면 추천순) */
export type ZonePostsSort = 'recommend' | 'likes' | 'distance';

/** 묶음 안 사진 목록. 위치 권한이 없으면 myLocation을 null로 (셋 다 뺀다). */
export function getZonePosts(zoneId: number, myLocation: MyLocation | null, sort?: ZonePostsSort) {
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

type RouteOptions = {
  /** 걷는 시간(분). 5~60, 기본 20 */
  minutes?: number;
  /** 목적지. 주면 가는 길에 들를 자리를 고른다. */
  destination?: Coordinate;
  /** 고른 해시태그(태그 사전 id) */
  tagIds?: number[];
  /** 고른 해시태그 이름('#' 없이). AI 해시태그처럼 id를 모를 때 쓴다. tagIds와 같이 보내면 어느 쪽이든 맞으면 고른다. */
  tags?: string[];
};

/** 산책 경로 추천. 들를 곳이 없으면 title은 null, stops는 빈 배열이다. 목적지를 한쪽만 주거나 minutes가 범위 밖이면 INVALID_INPUT */
export function getRouteRecommendation(from: Coordinate, { minutes, destination, tagIds, tags }: RouteOptions = {}) {
  return apiRequest<RouteRecommendation>('/recommendations/route', {
    query: { ...from, minutes, destLat: destination?.lat, destLng: destination?.lng, tagIds, tags },
  });
}
