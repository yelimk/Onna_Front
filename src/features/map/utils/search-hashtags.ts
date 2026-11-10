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

function toHashtagResult(result: HashtagSearchResult): HashtagResult {
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
}

/**
 * 화면 모양이 같은 해시태그 결과를 하나로 합친다.
 * 서버는 '말없이 챙겨준'(AI)과 '말없이챙겨준'(태그 사전)을 다른 태그로 주지만, 화면에서는 띄어쓰기를 지워 둘 다 '#말없이챙겨준'이 된다.
 * 따로 두면 같은 줄이 두 번 보이고, 하나를 눌러도 어느 쪽을 골랐는지 알 수 없다. 핀은 합치고(같은 기록은 한 번), 자리는 더 가까운 쪽을 쓴다.
 */
function mergeSameHashtags(results: HashtagResult[]) {
  const merged = new Map<string, HashtagResult>();
  for (const result of results) {
    const previous = merged.get(result.hashtag);
    if (!previous) {
      merged.set(result.hashtag, result);
      continue;
    }
    const nearer = result.distanceMeters < previous.distanceMeters ? result : previous;
    const pinIds = new Set(previous.postPins.map(({ postId }) => postId));
    const postPins = [...previous.postPins, ...result.postPins.filter(({ postId }) => !pinIds.has(postId))];
    // 한 기록에 두 태그가 다 붙어 있으면 두 번 세지 않도록 합친 핀 수로 센다. 핀이 없으면 서버 수를 더한다.
    const recordCount = postPins.length > 0 ? postPins.length : previous.recordCount + result.recordCount;
    merged.set(result.hashtag, { ...nearer, recordCount, postPins });
  }
  return [...merged.values()];
}

/**
 * 서버 결과(GET /search/hashtags, 가까운 순) → 화면 결과.
 * 화면의 기본 정렬은 '정확도순'이라 검색어와 똑같은 것 → 검색어로 시작하는 것 → 들어간 것 순으로 다시 놓고, 같으면 서버의 가까운 순을 지킨다.
 * 해시태그 이름은 띄어쓰기를 지운 모양이라 검색어도 띄어쓰기를 지우고 견준다.
 */
export function toHashtagResults(results: HashtagSearchResult[], keyword: string): HashtagResult[] {
  const target = formatHashtag(keyword).slice(1);
  const matchRank = (name: string) => (name === target ? 0 : name.startsWith(target) ? 1 : 2);
  return mergeSameHashtags(results.map(toHashtagResult)).sort((a, b) => matchRank(a.name) - matchRank(b.name));
}
