import { useMemo } from 'react';

import { useHomeMapMarkers } from '@/features/map/hooks/use-home-map-markers';
import { findZonePost } from '@/features/map/hooks/use-zone-posts';
import type { Coordinate, PhotoMarker } from '@/features/map/types/home-map-marker';
import type { SearchResultItem } from '@/features/map/types/search-result-item';

/**
 * 고른 해시태그가 붙은 기록 전부. 지도에 기록 자리마다 핀을 찍는 데 쓴다.
 * 자리는 해시태그 검색결과가 준 핀(postPins)을 쓰고, 지도 구역·묶음에서 이미 받은 기록이면 장소 이름·사진을 덧붙인다.
 */
export function useHashtagRecords(item: SearchResultItem | null, myLocation: Coordinate | null) {
  const { records } = useHomeMapMarkers(myLocation);

  return useMemo<PhotoMarker[]>(() => {
    if (item?.kind !== 'hashtag' || !item.postPins) return [];
    const hashtag = `#${item.title}`;
    return item.postPins.map(({ postId, coordinate }) => {
      const known = records.find(({ id }) => id === postId) ?? findZonePost(postId);
      // 핀 자리는 서버가 기록마다 준 좌표가 구역 자리보다 정확해서 그것을 쓴다.
      return known
        ? { ...known, coordinate }
        : { kind: 'photo', id: postId, coordinate, hashtags: [hashtag], isOpen: false };
    });
  }, [item, records]);
}
