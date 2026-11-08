import { useEffect, useSyncExternalStore } from 'react';
import { AppState } from 'react-native';

import { isApiError } from '@/api/api-error';
import { getMapZones } from '@/api/map';
import {
  defaultMapCenter,
  zonesCenterRefetchMeters,
  zonesRefetchMeters,
  zonesRefreshMs,
} from '@/features/map/constants/map-config';
import type { Coordinate } from '@/features/map/types/home-map-marker';
import { getDistanceMeters } from '@/features/map/utils/get-distance-meters';
import { toMyLocation, toServerCoordinate } from '@/features/map/utils/to-coordinate';
import type { Zone } from '@/types/api';

export type ZonesState = {
  zones: Zone[];
  /** 받지 못했을 때 그 이유. 로그인 안 함(UNAUTHORIZED 등), 인터넷 끊김(NETWORK_ERROR) */
  errorCode: string | null;
};

/*
 * 지도 구역은 앱 전체가 하나를 같이 쓴다. 지도 홈, 묶음, 검색, 길안내가 같은 기록을 봐야
 * 한 화면에서 연 사진이 다른 화면에서 잠겨 보이는 일이 없고, 화면마다 서버에 따로 묻지 않는다.
 */
let state: ZonesState = { zones: [], errorCode: null };
let lastRequest: { at: number; origin: Coordinate | null; center: Coordinate } | null = null;
/** 지도 홈이 마지막으로 알려 준 지도 가운데. 아직 모르면 null (그때는 내 위치, 그것도 모르면 캠퍼스 가운데) */
let mapCenter: Coordinate | null = null;
let isFetching = false;
/** 가장 최근에 화면이 알려 준 위치. 받는 중에 위치가 바뀌면, 끝난 뒤 이 위치로 다시 볼 수 있게 남겨 둔다. */
let latest: { origin: Coordinate | null; accuracy: number | null } = { origin: null, accuracy: null };
const listeners = new Set<() => void>();
/** 오래됐는지 보는 간격 */
const staleCheckMs = 30 * 1000;

function setState(next: ZonesState) {
  state = next;
  listeners.forEach((listener) => listener());
}

/** 구역을 받을 기준. 지도를 둘러본 곳이 먼저고, 아직 지도가 안 움직였으면 내 위치, 그것도 모르면 캠퍼스 가운데다. */
const getZonesCenter = (origin: Coordinate | null) => mapCenter ?? origin ?? defaultMapCenter;

/** 처음이거나, 사진 주소가 곧 만료되거나, 위치가 생기거나 없어졌거나, 꽤 걸었거나, 지도를 꽤 옮겼으면 다시 받는다. */
function shouldRefetch(origin: Coordinate | null) {
  if (!lastRequest) return true;
  if (Date.now() - lastRequest.at >= zonesRefreshMs) return true;
  if ((origin === null) !== (lastRequest.origin === null)) return true;
  if (getDistanceMeters(getZonesCenter(origin), lastRequest.center) >= zonesCenterRefetchMeters) return true;
  return origin !== null && lastRequest.origin !== null && getDistanceMeters(origin, lastRequest.origin) >= zonesRefetchMeters;
}

async function requestZones(location: Coordinate | null, accuracy: number | null) {
  latest = { origin: location, accuracy };
  const myLocation = toMyLocation(location, accuracy);
  // 오차를 아직 모르면 위치 없이 받은 것으로 친다. 오차가 잡히면 '위치가 생김'으로 보고 다시 받는다.
  const origin = myLocation ? location : null;
  if (isFetching || !shouldRefetch(origin)) return;
  isFetching = true;
  const center = getZonesCenter(origin);
  lastRequest = { at: Date.now(), origin, center };
  try {
    // 구역은 지도 가운데 둘레(서버 기본 500m)를 받고, 흐림 단계는 서버가 내 위치로 정한다.
    // 위치를 모르면 위치 셋(lat·lng·accuracy)을 다 뺀다. 서버는 이때 맛보기·내가 연 사진만 열어 주므로 앱이 따로 잠글 필요가 없다.
    const zones = await getMapZones(myLocation, { center: toServerCoordinate(center) });
    setState({ zones, errorCode: null });
  } catch (error) {
    // 받은 구역은 그대로 두고 이유만 알린다. 잠깐 끊겨도 지도가 텅 비지 않게 한다.
    setState({ ...state, errorCode: isApiError(error) ? error.code : 'UNKNOWN' });
    // 실패하면 다음 위치 갱신 때 바로 다시 시도하도록 기록을 지운다.
    lastRequest = null;
  } finally {
    isFetching = false;
  }
  // 받는 동안 처음 위치가 잡히면 그 위치 기준 구역을 아직 못 받은 것이라, 끝나자마자 다시 본다.
  // 실패했을 때는 위치가 다시 바뀌거나 시간이 지나야 다시 묻도록 여기서 바로 재시도하지 않는다.
  if (lastRequest && shouldRefetch(latest.origin)) requestZones(latest.origin, latest.accuracy);
}

/**
 * 지도 홈의 지도가 멈춘 곳을 알린다. 그 둘레가 꽤 바뀌었으면 구역을 다시 받는다.
 * 지도를 끌어 다른 곳을 보면 그곳에 남겨진 기록이 뜨게 하려는 것이다 (구역 범위는 내 위치가 아니라 지도 기준).
 */
export function setZonesCenter(center: Coordinate) {
  mapCenter = center;
  requestZones(latest.origin, latest.accuracy);
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const getSnapshot = () => state;

/**
 * 지도 가운데 둘레의 지도 구역(GET /map/zones). 지도가 아직 안 움직였으면 내 위치, 위치도 모르면 캠퍼스 가운데 둘레를 받는다.
 * 걸으면 흐림 단계가 바뀌므로 위치가 바뀔 때마다 다시 받을지 보고, 가만히 있어도 사진 주소가 만료되기 전에 다시 받는다.
 */
export function useMapZones(myLocation: Coordinate | null, accuracy: number | null) {
  const zonesState = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    requestZones(myLocation, accuracy);
    // 받은 지 zonesRefreshMs가 지났는지 자주 확인한다. 간격을 그 시간과 똑같이 두면 몇 ms 차이로 한 번 건너뛰어 사진 주소가 만료될 수 있다.
    const timer = setInterval(() => requestZones(myLocation, accuracy), staleCheckMs);
    // 앱이 뒤에 있는 동안은 타이머가 멈추므로, 다시 앞으로 오면 바로 확인한다.
    const subscription = AppState.addEventListener('change', (appState) => {
      if (appState === 'active') requestZones(myLocation, accuracy);
    });
    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, [myLocation, accuracy]);

  return zonesState;
}
