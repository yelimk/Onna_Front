import { useState } from 'react';

import { useAiWalkRoute } from '@/features/map/hooks/use-ai-walk-route';
import { useHomePlace } from '@/features/map/hooks/use-home-place';
import { usePlaceRoute } from '@/features/map/hooks/use-place-route';
import { useResultsMap, type ResultsMapView } from '@/features/map/hooks/use-results-map';
import type { Coordinate, MapMarker } from '@/features/map/types/home-map-marker';
import { openNavigation } from '@/features/map/utils/open-search-result';

/** 장소를 고르지 않았을 때 useResultsMap에 넘기는 빈 상태 */
const noPlaceView: ResultsMapView = { mode: 'list', items: [] };
/** 장소가 없을 때 핀. 매번 새 배열을 만들면 지도에 마커를 계속 다시 보내서 하나로 둔다. */
const noMarkers: MapMarker[] = [];

/**
 * 지도 홈의 두 경로 흐름을 한곳에서 다룬다. 둘 다 아래 경로 카드와 지도 선을 쓰지만 한 번에 하나만 뜬다.
 * - 장소 경로: 해시태그 검색에서 넘겨받은 장소 카드 → 해시태그 골라 경로 추천 (Figma '지도 해시태그 검색 시 경로 추천 UI')
 * - AI 추천 경로: '산책 경로 추천' 버튼 → 목적지 없이 취향에 맞는 자리를 잇는 길
 * 장소가 있으면 장소 경로가 먼저다. 장소 카드가 떠 있는 동안에는 경로 추천 버튼이 숨겨져 둘이 함께 뜨지 않는다.
 */
export function useHomeRoutes(myLocation: Coordinate | null) {
  const { place, clearPlace } = useHomePlace(myLocation);
  const placeRoute = usePlaceRoute(place, myLocation);
  const [cardHeight, setCardHeight] = useState(0);
  const placeMap = useResultsMap(placeRoute.mapView ?? noPlaceView, cardHeight);
  const aiRoute = useAiWalkRoute(myLocation, cardHeight);

  /** 카드의 X: 장소 경로를 보고 있으면 장소 카드로, 장소 카드면 장소 고르기를 끝낸다. AI 추천 경로면 경로를 닫는다. */
  const closeCard = () => {
    if (!place) aiRoute.close();
    else if (placeRoute.routePlan) placeRoute.closeRoute();
    else clearPlace();
  };

  const walkThisRoute = () => {
    if (!place) return aiRoute.walk();
    const plan = placeRoute.routePlan;
    if (!plan) return;
    openNavigation({
      destinationName: plan.destinationName,
      destination: plan.destination,
      stopIds: placeRoute.stops.map(({ id }) => id),
    });
  };

  return {
    card: placeRoute.card ?? aiRoute.card,
    cardHeight,
    setCardHeight,
    placeMarkers: place ? placeMap.markers : noMarkers,
    focus: place ? placeMap.focus : aiRoute.focus,
    routePath: place ? placeMap.routePath : aiRoute.path,
    isAiRouteShown: placeRoute.routePlan !== null || (!place && aiRoute.isActive),
    recommendRoute: placeRoute.recommendRoute,
    setIsRouteExpanded: place ? placeRoute.setIsRouteExpanded : aiRoute.setIsExpanded,
    closeCard,
    walkThisRoute,
    openAiRoute: aiRoute.open,
    closeAiRoute: aiRoute.close,
  };
}
