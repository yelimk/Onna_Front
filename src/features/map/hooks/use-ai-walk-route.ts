import { useEffect, useMemo, useState } from 'react';

import { getRouteRecommendation } from '@/api/map';
import { spacing } from '@/constants/layout';
import { getWalkRoute } from '@/features/map/api/get-walk-route';
import type { SelectedResultState } from '@/features/map/components/selected-result-card';
import { defaultMapCenter } from '@/features/map/constants/map-config';
import type { Coordinate, PhotoMarker } from '@/features/map/types/home-map-marker';
import { formatDistance } from '@/features/map/utils/format-distance';
import { rememberRecords } from '@/features/map/utils/known-records';
import { openNavigation } from '@/features/map/utils/open-search-result';
import { fromServerCoordinate, toServerCoordinate } from '@/features/map/utils/to-coordinate';
import { toStopRecords } from '@/features/map/utils/to-stop-records';

type AiRoute = {
  title: string | null;
  stops: PhotoMarker[];
  /** 지도에 그릴 선. 들를 자리가 없으면 null */
  path: Coordinate[] | null;
  distanceMeters: number | null;
  /** 서버에 닿지 못했거나 오류가 남 */
  isFailed: boolean;
};

const failedRoute: AiRoute = { title: null, stops: [], path: null, distanceMeters: null, isFailed: true };

/** 경로 선이 잘리지 않게 지도 가장자리에 두는 여백 */
const edge = spacing.xxl;

/**
 * 목적지 없이 서버에 산책 경로를 받는다. 서버는 내 취향에 맞는 안 연 사진을 고르고, AI 서버가 그 자리를 실제 걷는 길로 잇는다.
 * AI가 길을 못 주면(path null) 앱이 TMAP으로 잇는다. TMAP도 못 쓰면 직선이다.
 */
async function loadAiRoute(start: Coordinate, signal: AbortSignal): Promise<AiRoute> {
  try {
    const response = await getRouteRecommendation(toServerCoordinate(start));
    const stops = toStopRecords(response);
    // 길안내 화면이 들를 자리의 위치·해시태그를 다시 찾을 수 있게 기억해 둔다.
    rememberRecords(stops);
    const route = { title: response.title, stops, isFailed: false };
    if (response.path && response.path.length > 1) {
      return { ...route, path: response.path.map(fromServerCoordinate), distanceMeters: response.distanceM };
    }
    const last = stops.at(-1);
    if (!last) return { ...route, path: null, distanceMeters: null };
    const walk = await getWalkRoute(
      { start, destination: last.coordinate, destinationName: last.placeName ?? '', stops: stops.slice(0, -1) },
      signal,
    );
    return { ...route, path: walk.path, distanceMeters: Math.round(walk.distanceMeters) };
  } catch (error) {
    if (signal.aborted) throw error;
    return failedRoute;
  }
}

function getMessage(route: AiRoute) {
  if (route.isFailed) return '경로를 받지 못했어요. 잠시 뒤 다시 해 주세요';
  if (route.stops.length === 0) return '근처에 아직 들를 만한 자리가 없어요';
  return '취향에 맞는 자리를 이어 걷는 길이에요';
}

/**
 * 지도 홈 '산책 경로 추천' 버튼: 목적지 없이 AI 추천 경로를 받아 지도에 선을 그리고 경로 카드를 띄운다.
 * 기획서 '사진 잇는 경로 추천'("오늘 저녁, 이 세 자리를 잇는 20분 길")이다.
 * '이 길로 걷기'는 마지막 자리를 목적지로 삼아 길안내로 간다.
 */
export function useAiWalkRoute(myLocation: Coordinate | null, bottomInset: number) {
  // 누른 순간의 위치를 출발점으로 고정한다. 걸을 때마다 다시 받으면 경로가 계속 바뀐다.
  const [start, setStart] = useState<Coordinate | null>(null);
  const [result, setResult] = useState<{ start: Coordinate; route: AiRoute } | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (!start) return;
    const controller = new AbortController();
    loadAiRoute(start, controller.signal)
      .then((route) => setResult({ start, route }))
      .catch(() => {});
    return () => controller.abort();
  }, [start]);

  // 앞에서 받은 경로가 남아 있으면 보여주지 않는다.
  const route = result && result.start === start ? result.route : null;

  const card = useMemo<SelectedResultState | null>(() => {
    if (!start) return null;
    const stops = route?.stops ?? [];
    return {
      mode: 'route',
      key: `ai-${start.latitude},${start.longitude}`,
      title: route?.title ?? '산책 경로 추천',
      details: route?.distanceMeters ? `${formatDistance(route.distanceMeters)} · ${stops.length}곳을 들러요` : '',
      stops,
      message: route ? getMessage(route) : '취향에 맞는 자리를 찾는 중이에요',
      canWalk: stops.length > 0,
      isLoading: route === null,
      isExpanded,
    };
  }, [start, route, isExpanded]);

  const rawFocus = useMemo(() => {
    if (!start) return undefined;
    const coordinates = route?.path ?? [start, ...(route?.stops ?? []).map(({ coordinate }) => coordinate)];
    return { coordinates, padding: { top: edge, right: edge, bottom: bottomInset + edge, left: edge } };
  }, [start, route, bottomInset]);
  // 카드 높이가 같은 값으로 다시 잡혀도 지도를 다시 맞추지 않는다. 다시 맞추면 둘러보는 중에 화면이 튄다.
  const focusKey = JSON.stringify(rawFocus ?? null);
  const focus = useMemo(() => (JSON.parse(focusKey) as typeof rawFocus | null) ?? undefined, [focusKey]);

  const open = () => {
    setIsExpanded(true);
    // 위치를 모르면 캠퍼스에서 출발한다고 본다. 같은 자리에서 다시 눌러도 새로 받도록 새 값으로 넣는다.
    setStart({ ...(myLocation ?? defaultMapCenter) });
  };

  const walk = () => {
    const stops = route?.stops ?? [];
    const last = stops.at(-1);
    if (!last) return;
    openNavigation({
      destinationName: last.placeName ?? last.title ?? '',
      destination: last.coordinate,
      stopIds: stops.slice(0, -1).map(({ id }) => id),
      // 지도에 그린 길(AI 길, 없으면 TMAP·직선)을 길안내도 그대로 쓴다.
      path: route?.path,
    });
  };

  return {
    isActive: start !== null,
    card,
    focus,
    path: route?.path ?? null,
    open,
    close: () => setStart(null),
    walk,
    setIsExpanded,
  };
}
