import { useEffect, useMemo } from 'react';

import { useHomeMapMarkers } from '@/features/map/hooks/use-home-map-markers';
import type { Coordinate, PhotoMarker } from '@/features/map/types/home-map-marker';
import type { SearchResultItem } from '@/features/map/types/search-result-item';
import { findKnownRecord, rememberRecords } from '@/features/map/utils/known-records';

/**
 * 고른 해시태그가 붙은 기록 전부. 지도에 기록 자리마다 핀을 찍는 데 쓴다.
 * 자리·장소 이름은 해시태그 검색결과가 준 핀(postPins)을 쓰고, 지도 구역·묶음에서 이미 받은 기록이면 사진·제목을 덧붙인다.
 */
export function useHashtagRecords(item: SearchResultItem | null, myLocation: Coordinate | null) {
  const { records } = useHomeMapMarkers(myLocation);

  const hashtagRecords = useMemo<PhotoMarker[]>(() => {
    if (item?.kind !== 'hashtag' || !item.postPins) return [];
    const hashtag = `#${item.title}`;
    return item.postPins.map(({ postId, coordinate, placeName }) => {
      const known = records.find(({ id }) => id === postId) ?? findKnownRecord(postId);
      // 구역 밖 기록은 장소 이름이 null이라, 기록 카드가 동네 이름으로 대신하게 비워 둔다.
      const pinPlace = placeName ?? undefined;
      return known
        ? { ...known, coordinate, placeName: pinPlace ?? known.placeName }
        : { kind: 'photo', id: postId, coordinate, hashtags: [hashtag], isOpen: false, placeName: pinPlace };
    });
  }, [item, records]);

  // 핀을 눌러 연 사진 카드가 이 기록의 자리·해시태그를 찾을 수 있게 기억해 둔다.
  useEffect(() => rememberRecords(hashtagRecords), [hashtagRecords]);

  return hashtagRecords;
}
