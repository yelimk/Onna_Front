import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { getTokens } from '@/api/token-storage';
import { colors } from '@/constants/colors';
import { splashLogoSize } from '@/constants/layout';
import { getScreenAfterLogin } from '@/features/auth/utils/go-after-login';
import { hasSeenIntro } from '@/features/auth/utils/intro-seen';

/** 시작 화면 로고를 적어도 보여 주는 시간 */
const minSplashMs = 1000;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 앱을 켜면 처음 지나는 화면. 저장된 출입증이 있으면 로그인 화면을 건너뛰고 바로 들어간다.
 * 로그인 전이면 처음 설치한 사람에게만 소개 3장을 보여주고, 이미 본 사람은 바로 로그인으로 보낸다.
 * 확인하는 동안 스플래시와 같은 주황 화면과 로고를 보여준다.
 * 확인이 빨리 끝나도 로고가 깜빡 지나가지 않게, 적어도 1초는 보여 준 뒤 넘어간다 (팀 결정).
 */
export function StartScreen() {
  useEffect(() => {
    const getLoginStart = async () => ((await hasSeenIntro()) ? '/login' : '/intro');

    const decideFirstScreen = async () => {
      const tokens = await getTokens();
      if (!tokens) return getLoginStart();
      try {
        return await getScreenAfterLogin();
      } catch {
        // 출입증이 만료돼 재발급도 실패했거나 서버에 닿지 않으면 처음부터 로그인하게 한다
        return getLoginStart();
      }
    };

    // 갈 곳을 정하는 동안 1초를 같이 센다. 정하는 데 1초보다 오래 걸리면 기다리지 않고 바로 넘어간다
    Promise.all([decideFirstScreen(), wait(minSplashMs)]).then(([screen]) => router.replace(screen));
  }, []);

  return (
    <View style={styles.screen}>
      {/* 주황 배경 위라 시계·배터리를 흰색으로 (Figma 스플래쉬 화면) */}
      <StatusBar style="light" />
      {/* 앱이 켜질 때의 기본 스플래시(app.json)와 같은 그림·크기·자리에 두어, 넘어가는 순간 화면이 튀지 않게 한다.
          Expo Go는 기본 스플래시 대신 앱 아이콘을 보여 줘서, 여기서 보이는 로고가 Figma 스플래시 화면 역할을 한다. */}
      <Image source={require('@/assets/images/splash-logo.png')} style={styles.logo} contentFit="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  // 기본 스플래시처럼 로고를 화면 정가운데에 둔다
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  logo: splashLogoSize,
});
