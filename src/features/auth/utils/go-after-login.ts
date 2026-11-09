import { router } from 'expo-router';

import { getMe } from '@/api/users';

/**
 * 로그인한 사용자가 갈 첫 화면.
 * 취향 설문을 아직 안 했으면(onboarded=false) 권한 안내 → 설문으로, 했으면 바로 지도로.
 */
export async function getScreenAfterLogin() {
  const me = await getMe();
  return me.onboarded ? '/map' : '/permission';
}

/** 로그인한 사용자를 알맞은 첫 화면으로 보낸다. 로그인·회원가입에서 쓴다 */
export async function goAfterLogin() {
  router.replace(await getScreenAfterLogin());
}
