import type { Me } from '@/types/api';

/**
 * 한 번 받은 내 정보. 닉네임은 바꾸는 화면이 없어 바뀌지 않으므로, 마이 탭에 들어올 때마다 다시 받지 않고 이 값을 쓴다.
 * 다른 계정으로 바뀌면 남이 보이면 안 되므로, 출입증을 지울 때(로그아웃, 탈퇴, 로그인 풀림) 같이 지운다 (token-storage.ts).
 * 앱이 켜져 있는 동안만 기억한다.
 */
let lastMe: Me | null = null;

export function getCachedMe() {
  return lastMe;
}

export function setCachedMe(me: Me) {
  lastMe = me;
}

export function clearCachedMe() {
  lastMe = null;
}
