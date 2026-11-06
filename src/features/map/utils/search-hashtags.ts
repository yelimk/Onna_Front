import type { Coordinate } from '@/features/map/types/home-map-marker';
import type { PostPin } from '@/features/map/types/search-result-item';
import { fromServerCoordinate } from '@/features/map/utils/to-coordinate';
import type { HashtagSearchResult } from '@/types/api';
import { formatHashtag } from '@/utils/format-hashtag';

/** 해시태그 검색결과 한 줄 */
export type HashtagResult = {
  /** '#'을 뗀 이름 (Figma 목록이 '#' 없이 보여준다) */
  name: string;
  hashtag: string;
  /** 내 위치에서 가장 가까운 이 해시태그 기록의 자리 (서버가 준다) */
  coordinate: Coordinate;
  distanceMeters: number;
  /** 이 해시태그가 붙은 공개 기록 수 */
  recordCount: number;
  postPins: PostPin[];
};

/** '#정문 ' → '정문'. 사용자가 '#'을 붙여도, 안 붙여도 같은 결과가 나오게 한다. */
export function toHashtagKeyword(query: string) {
  return query.trim().replace(/^#+/, '').trim();
}

/**
 * 서버 결과(GET /search/hashtags, 가까운 순) → 화면 결과.
 * 화면의 기본 정렬은 '정확도순'이라 검색어와 똑같은 것 → 검색어로 시작하는 것 → 들어간 것 순으로 다시 놓고, 같으면 서버의 가까운 순을 지킨다.
 */
export function toHashtagResults(results: HashtagSearchResult[], keyword: string): HashtagResult[] {
  const matchRank = (name: string) => (name === keyword ? 0 : name.startsWith(keyword) ? 1 : 2);
  return results
    .map((result) => {
      const hashtag = formatHashtag(result.name);
      return {
        name: hashtag.slice(1),
        hashtag,
        coordinate: fromServerCoordinate(result),
        distanceMeters: result.distanceM,
        recordCount: result.postCount,
        postPins: result.posts.map((post) => ({
          postId: String(post.postId),
          coordinate: fromServerCoordinate(post),
          placeName: post.zoneName,
        })),
      };
    })
    .sort((a, b) => matchRank(a.name) - matchRank(b.name));
}
