import { router } from 'expo-router';
import { useEffect } from 'react';

import { onSessionExpired } from '@/api/session-events';
import { showToast } from '@/components/toast';

/**
 * 앱을 켜 둔 채로 로그인이 풀리면(출입증 재발급 실패) 어느 화면에 있든 로그인 화면으로 보낸다.
 * 그냥 두면 마이 탭 닉네임이 비고 숫자가 예시로 보이는 등 화면이 이상해진다.
 * 앱을 새로 켤 때는 시작 화면(start-screen)이 먼저 확인해서 로그인으로 보낸다. 루트 레이아웃(app/_layout.tsx)에 한 번만 둔다.
 * 왜 로그인 화면으로 왔는지 알 수 있게 짧은 안내 토스트를 띄운다 (Figma에 없어서 프론트가 정한 문구).
 */
export function useSessionExpiredRedirect() {
  useEffect(
    () =>
      onSessionExpired(() => {
        router.replace('/login');
        showToast('로그인이 풀렸어요. 다시 로그인해 주세요', 'plain');
      }),
    [],
  );
}
