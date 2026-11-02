import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const accessTokenKey = 'onna.accessToken';
const refreshTokenKey = 'onna.refreshToken';

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

// 로그인 출입증(토큰)은 폰의 암호화된 저장소(SecureStore)에 둔다.
// 웹 미리보기에는 SecureStore가 없어서, 화면 확인용으로만 브라우저 저장소를 쓴다.
const storage = {
  get: (key: string) =>
    Platform.OS === 'web' ? Promise.resolve(globalThis.localStorage?.getItem(key) ?? null) : SecureStore.getItemAsync(key),
  set: (key: string, value: string) =>
    Platform.OS === 'web' ? Promise.resolve(globalThis.localStorage?.setItem(key, value)) : SecureStore.setItemAsync(key, value),
  remove: (key: string) =>
    Platform.OS === 'web' ? Promise.resolve(globalThis.localStorage?.removeItem(key)) : SecureStore.deleteItemAsync(key),
};

export async function getTokens(): Promise<Tokens | null> {
  const [accessToken, refreshToken] = await Promise.all([storage.get(accessTokenKey), storage.get(refreshTokenKey)]);
  return accessToken && refreshToken ? { accessToken, refreshToken } : null;
}

export async function saveTokens({ accessToken, refreshToken }: Tokens) {
  await Promise.all([storage.set(accessTokenKey, accessToken), storage.set(refreshTokenKey, refreshToken)]);
}

export async function clearTokens() {
  await Promise.all([storage.remove(accessTokenKey), storage.remove(refreshTokenKey)]);
}
