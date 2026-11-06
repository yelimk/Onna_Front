import { router } from 'expo-router';
import { useEffect } from 'react';

import { onSessionExpired } from '@/api/session-events';

/**
 * 앱을 켜 둔 채로 로그인이 풀리면(출입증 재발급 실패) 어느 화면에 있든 로그인 화면으로 보낸다.
 * 그냥 두면 마이 탭 닉네임이 비고 숫자가 예시로 보이는 등 화면이 이상해진다.
 * 앱을 새로 켤 때는 시작 화면(start-screen)이 먼저 확인해서 로그인으로 보낸다. 루트 레이아웃(app/_layout.tsx)에 한 번만 둔다.
 * 안내 토스트는 띄우지 않는다. Figma에 없고, 로그인 화면만으로 충분하다고 봤다 (팀 결정).
 */
export function useSessionExpiredRedirect() {
  useEffect(() => onSessionExpired(() => router.replace('/login')), []);
}
