import type { LayoutChangeEvent } from 'react-native';

import { HashtagSummaryCard } from '@/features/map/components/hashtag-summary-card';
import { RecordPlaceCard } from '@/features/map/components/record-place-card';
import { RouteCard } from '@/features/map/components/route-card';
import { RouteStartCard } from '@/features/map/components/route-start-card';
import type { PhotoMarker } from '@/features/map/types/home-map-marker';
import type { SearchResultItem } from '@/features/map/types/search-result-item';
import { openRecord } from '@/features/map/utils/open-search-result';
import type { NearbyRecordSummary } from '@/features/map/utils/summarize-nearby-records';

/** 고른 결과에 따라 아래에 띄울 카드. 화면이 상태를 정하고, 이 부품은 맞는 카드만 고른다. */
export type SelectedResultState =
  | { mode: 'place'; item: SearchResultItem; nearby: NearbyRecordSummary }
  | {
      mode: 'route';
      /** 카드를 새로 그릴 기준. 다른 경로로 바뀌면 카드도 새로 만든다. */
      key: string;
      title: string;
      details: string;
      stops: PhotoMarker[];
      message: string;
      canWalk: boolean;
      isLoading: boolean;
      isExpanded: boolean;
    }
  | { mode: 'hashtag'; item: SearchResultItem; nearbyRecordCount: number }
  | {
      mode: 'record';
      record: PhotoMarker;
      hashtag: string;
      regionName: string;
      distanceMeters: number | null;
    };

/**
 * 카드마다 다른 이름. SlidingPanel의 key로 쓰면 이름이 바뀔 때 이전 카드가 내려가고 새 카드가 올라온다.
 * 경로 카드를 접고 펼치거나 경로를 받는 중인 것은 같은 카드라 이름에 넣지 않는다.
 */
export function getSelectedResultKey(state: SelectedResultState) {
  if (state.mode === 'record') return `record-${state.record.id}`;
  // 경로 카드의 key는 고른 장소(또는 AI 추천 경로)의 key와 같다.
  return `${state.mode}-${state.mode === 'route' ? state.key : state.item.key}`;
}

type SelectedResultCardProps = {
  state: SelectedResultState;
  onLayout: (event: LayoutChangeEvent) => void;
  onClose: () => void;
  onRecommend: (hashtags: string[]) => void;
  onRouteExpandedChange: (isExpanded: boolean) => void;
  onWalk: () => void;
  /** 기록 카드를 누름: 그 장소로 지도 홈에서 경로를 추천받으러 간다. 기록 카드가 뜨는 검색결과 화면만 넘긴다. */
  onOpenRecord?: (record: PhotoMarker, regionName: string) => void;
};

export function SelectedResultCard({
  state,
  onLayout,
  onClose,
  onRecommend,
  onRouteExpandedChange,
  onWalk,
  onOpenRecord,
}: SelectedResultCardProps) {
  switch (state.mode) {
    case 'place':
      return (
        <RouteStartCard
          key={state.item.key}
          item={state.item}
          nearby={state.nearby}
          onClose={onClose}
          onRecommend={onRecommend}
          onLayout={onLayout}
        />
      );
    case 'route':
      return (
        <RouteCard
          key={state.key}
          title={state.title}
          details={state.details}
          stops={state.stops}
          message={state.message}
          canWalk={state.canWalk}
          isLoading={state.isLoading}
          isExpanded={state.isExpanded}
          onExpandedChange={onRouteExpandedChange}
          onClose={onClose}
          onWalk={onWalk}
          onLayout={onLayout}
        />
      );
    case 'hashtag':
      return (
        <HashtagSummaryCard
          item={state.item}
          nearbyRecordCount={state.nearbyRecordCount}
          onClose={onClose}
          onLayout={onLayout}
        />
      );
    case 'record':
      return (
        <RecordPlaceCard
          record={state.record}
          hashtag={state.hashtag}
          regionName={state.regionName}
          distanceMeters={state.distanceMeters}
          onClose={onClose}
          onOpen={() => onOpenRecord?.(state.record, state.regionName)}
          onOpenPhoto={() => openRecord(state.record.id)}
          onLayout={onLayout}
        />
      );
  }
}
