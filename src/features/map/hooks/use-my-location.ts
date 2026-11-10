import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { AppState, Linking } from 'react-native';

import type { Coordinate } from '@/features/map/types/home-map-marker';

/*
 * 내 위치와 위치 권한은 앱 전체가 하나를 같이 쓴다.
 * 권한을 화면마다 따로 들고 있으면, 한 화면(또는 남기기·온보딩)에서 권한을 켜도 다른 화면은 '꺼짐'으로 남는다.
 * (지도 홈의 위치 권한 안내가 켠 뒤에도 계속 떠서 앱을 다시 켜야 했던 문제)
 * 화면마다 따로 지켜보면 GPS가 여러 개 돌아 배터리를 쓰고, 새 화면은 위치를 모르는 채로 시작한다.
 * 위치를 쓰는 화면이 하나라도 떠 있으면 지켜보고, 모두 닫히면 멈춘다. 마지막 위치는 기억해 둔다.
 */
let currentLocation: Coordinate | null = null;
/** 마지막 위치의 오차 반경(m). 서버가 사진을 열어 줄지 정할 때 같이 보낸다. */
let currentAccuracy: number | null = null;
/** 위치 권한. 아직 확인 전이면 null */
let permission: Location.PermissionResponse | null = null;
let watcher: Promise<Location.LocationSubscription | null> | null = null;
let watchingScreens = 0;
const listeners = new Set<() => void>();

function startWatching() {
  watcher = Location.watchPositionAsync(
    // 5m마다 받으면 열림 반경에 들어왔는지 알기에 충분하고, 배터리를 덜 쓴다.
    { accuracy: Location.Accuracy.High, distanceInterval: 5 },
    ({ coords }) => {
      currentLocation = { latitude: coords.latitude, longitude: coords.longitude };
      currentAccuracy = coords.accuracy;
      listeners.forEach((listener) => listener());
    },
  ).catch(() => {
    // 위치 서비스가 꺼져 있으면 실패한다. 다음에 화면이 다시 위치를 쓰려 할 때 다시 시도한다.
    watcher = null;
    return null;
  });
}

function watchLocation() {
  watchingScreens += 1;
  if (!watcher) startWatching();
  return () => {
    watchingScreens -= 1;
    if (watchingScreens > 0 || !watcher) return;
    const stopping = watcher;
    watcher = null;
    stopping.then((subscription) => subscription?.remove());
  };
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const getSnapshot = () => currentLocation;
const getAccuracySnapshot = () => currentAccuracy;
const getPermissionSnapshot = () => permission;

function setPermission(next: Location.PermissionResponse) {
  permission = next;
  listeners.forEach((listener) => listener());
}

/** 지금 권한을 다시 확인해 모든 화면에 알린다. 설정 앱이나 다른 화면에서 바꾼 권한도 이걸로 따라온다. */
function refreshPermission() {
  Location.getForegroundPermissionsAsync()
    .then(setPermission)
    .catch(() => {});
}

/** 권한을 요청한다. 한 번 거절해서 다시 물을 수 없으면 시스템 창이 뜨지 않으므로 설정 화면으로 보낸다. */
async function requestPermission() {
  if (permission && !permission.granted && !permission.canAskAgain) {
    await Linking.openSettings();
    return;
  }
  setPermission(await Location.requestForegroundPermissionsAsync());
}

/** 지금 내 위치의 오차 반경(m). 위치를 아직 모르면 null. 서버 요청에 위치와 같이 보낼 때 쓴다. */
export function useLocationAccuracy() {
  return useSyncExternalStore(subscribe, getAccuracySnapshot, getAccuracySnapshot);
}

/**
 * 위치 권한과 지금 내 위치. 권한이 있으면 걸을 때마다 위치를 새로 받는다.
 * 가까이 가야 사진이 열리는 지도라서, 한 번만 받지 않고 계속 지켜본다.
 */
export function useMyLocation() {
  const currentPermission = useSyncExternalStore(subscribe, getPermissionSnapshot, getPermissionSnapshot);
  const location = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const isGranted = currentPermission?.granted ?? false;

  // 화면에 들어올 때마다 다시 확인한다. 다른 화면에서 권한을 켜고 돌아와도 바로 따라오게 한다.
  useFocusEffect(useCallback(() => refreshPermission(), []));

  // 설정 앱에서 권한을 켜고 돌아오면 화면은 그대로라, 앱이 다시 앞으로 올 때마다 확인한다.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refreshPermission();
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (isGranted) return watchLocation();
  }, [isGranted]);

  return {
    /** 권한 상태를 아직 확인하는 중이면 true. 이때 권한 안내를 띄우면 잠깐 깜빡인다. */
    isChecking: currentPermission === null,
    isGranted,
    location,
    request: requestPermission,
  };
}
