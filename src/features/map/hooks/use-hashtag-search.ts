import { useEffect, useMemo, useState } from 'react';

import { isApiError } from '@/api/api-error';
import { searchHashtags } from '@/api/map';
import { getRegionName } from '@/features/map/api/get-region-name';
import { defaultMapCenter } from '@/features/map/constants/map-config';
import type { Coordinate } from '@/features/map/types/home-map-marker';
import { toHashtagKeyword, toHashtagResults, type HashtagResult } from '@/features/map/utils/search-hashtags';
import { toServerCoordinate } from '@/features/map/utils/to-coordinate';

/** 글자를 칠 때마다 서버에 묻지 않도록, 장소 검색처럼 손을 멈춘 뒤에 찾는다. */
const debounceMs = 300;

type SearchState = { keyword: string; results: HashtagResult[]; errorMessage: string | null };

const emptyState: SearchState = { keyword: '', results: [], errorMessage: null };

/**
 * 해시태그 검색(GET /search/hashtags). 서버가 가까운 순으로 주는 결과를 정확도순으로 다시 놓는다.
 * 검색 기준점은 장소 검색처럼 처음 받은 위치로 고정한다. 걸을 때마다 다시 찾으면 고른 결과가 목록에서 사라질 수 있다.
 * 결과마다 가장 가까운 기록의 동네 이름('경산시 대동')을 카카오 로컬 API로 찾아 붙인다. 못 찾아도 결과는 보여준다.
 */
export function useHashtagSearch(query: string, myLocation: Coordinate | null) {
  const keyword = toHashtagKeyword(query);
  const [state, setState] = useState<SearchState>(emptyState);
  const [searchCenter, setSearchCenter] = useState<Coordinate | null>(myLocation);
  if (!searchCenter && myLocation) setSearchCenter(myLocation);

  useEffect(() => {
    if (!keyword) return;
    let isStale = false;
    const timer = setTimeout(() => {
      searchHashtags(keyword, toServerCoordinate(searchCenter ?? defaultMapCenter))
        .then((results) => {
          if (!isStale) setState({ keyword, results: toHashtagResults(results, keyword), errorMessage: null });
        })
        // 장소 결과는 그대로 보여야 해서 알림창 대신 해시태그 목록 자리에 이유만 보여준다.
        .catch((error: unknown) => {
          if (!isStale) setState({ keyword, results: [], errorMessage: getHashtagErrorMessage(error) });
        });
    }, debounceMs);
    // 검색어가 바뀌면 앞 요청의 늦은 응답이 새 결과를 덮지 않게 버린다.
    return () => {
      isStale = true;
      clearTimeout(timer);
    };
  }, [keyword, searchCenter]);

  const results = keyword ? state.results : emptyState.results;
  const [regionNames, setRegionNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const controller = new AbortController();
    Promise.all(
      results.map((result) =>
        getRegionName(result.coordinate, controller.signal)
          .then((name) => [result.hashtag, name] as const)
          .catch(() => [result.hashtag, ''] as const),
      ),
    ).then((entries) => {
      if (!controller.signal.aborted) setRegionNames((current) => ({ ...current, ...Object.fromEntries(entries) }));
    });
    return () => controller.abort();
  }, [results]);

  const resultsWithRegion = useMemo(
    () => results.map((result) => ({ ...result, regionName: regionNames[result.hashtag] ?? '' })),
    [results, regionNames],
  );
  return { results: resultsWithRegion, errorMessage: keyword ? state.errorMessage : null };
}

function getHashtagErrorMessage(error: unknown) {
  if (isApiError(error, 'UNAUTHORIZED') || isApiError(error, 'INVALID_TOKEN')) return '로그인하면 해시태그를 찾을 수 있어요';
  if (isApiError(error, 'NETWORK_ERROR')) return '인터넷 연결을 확인해 주세요';
  return '해시태그를 불러오지 못했어요. 잠시 후 다시 시도해 주세요';
}
