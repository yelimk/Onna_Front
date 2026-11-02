import { router } from 'expo-router';

import { getMe } from '@/api/users';

/**
 * 로그인한 사용자를 알맞은 첫 화면으로 보낸다.
 * 취향 설문을 아직 안 했으면(onboarded=false) 권한 안내 → 설문으로, 했으면 바로 지도로.
 * 로그인·회원가입·앱 시작에서 같이 쓴다.
 */
export async function goAfterLogin() {
  const me = await getMe();
  router.replace(me.onboarded ? '/map' : '/permission');
}
