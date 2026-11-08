import { router } from 'expo-router';

import type { Coordinate } from '@/features/map/types/home-map-marker';

/** 기록 하나의 사진 카드를 띄운다 (Figma '지도 사진 남기기 UI'). */
export function openRecord(recordId: string) {
  router.push(`/photo/${recordId}`);
}

/** 검색결과 화면으로 간다. selectKey를 주면 그 결과를 고른 상태(경로 추천 카드)로 연다. */
export function openSearchResults(query: string, selectKey?: string) {
  router.push({ pathname: '/map/results', params: selectKey ? { query, select: selectKey } : { query } });
}

type HomePlace = {
  name: string;
  address: string;
  coordinate: Coordinate;
};

/**
 * 검색을 닫고 지도 홈으로 돌아가, 그 장소를 고른 상태(장소 카드)로 연다.
 * Figma '지도 해시태그 검색 시 경로 추천 UI': 해시태그 검색에서 찾은 기록의 장소로 홈에서 경로를 추천받는다.
 */
export function openPlaceOnHome({ name, address, coordinate }: HomePlace) {
  router.dismissTo({
    pathname: '/map',
    params: {
      placeName: name,
      placeAddress: address,
      latitude: String(coordinate.latitude),
      longitude: String(coordinate.longitude),
    },
  });
}

type NavigationRequest = {
  destinationName: string;
  destination: Coordinate;
  /** 경로 추천에서 고른 '들를 자리'. 길안내도 같은 자리를 들르도록 그대로 넘긴다. */
  stopIds: string[];
  /** 이미 받은 걷는 길(지도 홈 AI 추천 경로). 주면 길안내가 같은 길을 쓰고, 없으면 길안내가 TMAP으로 새로 받는다. */
  path?: Coordinate[] | null;
};

/*
 * 길 좌표는 수백 개라 주소 파라미터에 담지 않고 앱 안에 둔다. 주소에는 이 길의 번호만 싣는다.
 * 길안내는 한 번에 하나라서 가장 최근 길 하나만 기억한다.
 */
let passedPath: { id: string; path: Coordinate[] } | null = null;

/** openNavigation으로 넘긴 길. 번호가 다르면(앱을 다시 켜서 잃었거나 다른 길) null */
export const findPassedPath = (id: string | undefined) => (id && passedPath?.id === id ? passedPath.path : null);

/**
 * '이 길로 걷기': 길안내 화면으로 간다.
 * 주소 파라미터는 문자열만 받아서 들를 자리 목록은 쉼표로 이어 붙인다.
 */
export function openNavigation({ destinationName, destination, stopIds, path }: NavigationRequest) {
  const pathId = path && path.length > 1 ? String(Date.now()) : undefined;
  if (pathId && path) passedPath = { id: pathId, path };
  router.push({
    pathname: '/map/navigation',
    params: {
      destinationName,
      latitude: String(destination.latitude),
      longitude: String(destination.longitude),
      stopIds: stopIds.join(','),
      ...(pathId && { pathId }),
    },
  });
}
