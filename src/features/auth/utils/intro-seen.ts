import AsyncStorage from '@react-native-async-storage/async-storage';

const introSeenKey = 'onna.introSeen';

/**
 * 소개 3장은 앱을 처음 설치했을 때 한 번만 보여준다.
 * 앱을 지우면 같이 지워져야 해서, 아이폰에서 앱을 지워도 남는 SecureStore 대신 AsyncStorage에 적는다.
 * 읽기·쓰기가 실패하면 소개를 한 번 더 보여주는 쪽이 안전해서 '안 봤음'으로 본다.
 */
export async function hasSeenIntro() {
  return (await AsyncStorage.getItem(introSeenKey).catch(() => null)) === 'true';
}

export function markIntroSeen() {
  return AsyncStorage.setItem(introSeenKey, 'true').catch(() => undefined);
}
