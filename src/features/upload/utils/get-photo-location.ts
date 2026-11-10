import * as Location from 'expo-location';

import type { MyLocation } from '@/types/api';

const unknownAccuracyMeters = 999;

/**
 * 셔터를 누른 순간의 내 위치. 서버는 정확도가 50m보다 나쁘면 RETRY_LOCATION으로 거절해서 높은 정확도로 잡는다.
 * 위치 권한이 없거나 위치를 못 잡으면 null (남기기는 위치가 있어야 해서 화면이 안내한다).
 */
export async function getPhotoLocation(): Promise<MyLocation | null> {
  try {
    const permission = await Location.getForegroundPermissionsAsync();
    const granted = permission.granted || (await Location.requestForegroundPermissionsAsync()).granted;
    if (!granted) return null;

    const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    // 정확도를 모르면 '정확하다'고 속이지 않도록 아주 나쁜 값으로 보내서 서버가 다시 재 달라고 하게 한다
    return { lat: coords.latitude, lng: coords.longitude, accuracy: coords.accuracy ?? unknownAccuracyMeters };
  } catch {
    return null;
  }
}

/** 위치 권한이 켜져 있는지. 위치를 못 잡았을 때 권한 문제인지, 신호 문제인지 나눠서 안내하려고 쓴다. */
export async function hasLocationPermission() {
  const permission = await Location.getForegroundPermissionsAsync().catch(() => null);
  return permission?.granted ?? false;
}
