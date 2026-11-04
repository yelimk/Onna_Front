import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

const seenAtKey = 'onna.notificationsSeenAt';

/*
 * 알림 화면을 마지막으로 나간 시각. 서버가 안 읽음 표시를 주지 않아서, 이 시각보다 늦게 온 알림을 '새 알림'으로 본다.
 * 앱을 껐다 켜도 남아야 해서 폰에 적고, 쓰는 즉시 마이 탭 종 점도 사라지게 메모리에 들고 바뀔 때 알린다.
 * 처음 설치했으면 0이라 모든 알림이 새 알림이다.
 */
let seenAt: number | undefined;
const listeners = new Set<() => void>();

export async function getNotificationsSeenAt() {
  if (seenAt === undefined) {
    const stored = await AsyncStorage.getItem(seenAtKey).catch(() => null);
    if (seenAt === undefined) {
      seenAt = Number(stored ?? 0);
      listeners.forEach((listener) => listener());
    }
  }
  return seenAt;
}

export function markNotificationsSeen() {
  seenAt = Date.now();
  AsyncStorage.setItem(seenAtKey, String(seenAt)).catch(() => undefined);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** 지금 기억하는 시각. 폰에서 읽어 오기 전에는 undefined */
export function useNotificationsSeenAt() {
  return useSyncExternalStore(subscribe, () => seenAt);
}
