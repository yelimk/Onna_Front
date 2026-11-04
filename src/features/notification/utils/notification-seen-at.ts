import AsyncStorage from '@react-native-async-storage/async-storage';

const seenAtKey = 'onna.notificationsSeenAt';

/*
 * 알림 화면을 마지막으로 나간 시각. 서버가 안 읽음 표시를 주지 않아서, 이 시각보다 늦게 온 알림을 '새 알림'으로 본다.
 * 앱을 껐다 켜도 남아야 해서 폰에 적고, 쓰는 즉시 다른 화면이 읽을 수 있게 메모리에도 들고 있는다.
 * 처음 설치했으면 0이라 모든 알림이 새 알림이다.
 */
let seenAt: number | undefined;

export async function getNotificationsSeenAt() {
  if (seenAt === undefined) {
    const stored = await AsyncStorage.getItem(seenAtKey).catch(() => null);
    seenAt ??= Number(stored ?? 0);
  }
  return seenAt;
}

export function markNotificationsSeen() {
  seenAt = Date.now();
  AsyncStorage.setItem(seenAtKey, String(seenAt)).catch(() => undefined);
}
