import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { getTokens } from '@/api/token-storage';
import { colors } from '@/constants/colors';
import { goAfterLogin } from '@/features/auth/utils/go-after-login';
import { hasSeenIntro } from '@/features/auth/utils/intro-seen';

/**
 * 앱을 켜면 처음 지나는 화면. 저장된 출입증이 있으면 로그인 화면을 건너뛰고 바로 들어간다.
 * 로그인 전이면 처음 설치한 사람에게만 소개 3장을 보여주고, 이미 본 사람은 바로 로그인으로 보낸다.
 * 확인하는 짧은 동안 스플래시와 같은 주황 화면을 보여줘서 화면이 깜빡이지 않게 한다.
 */
export function StartScreen() {
  useEffect(() => {
    const goToLoginStart = async () => router.replace((await hasSeenIntro()) ? '/login' : '/intro');

    const decideFirstScreen = async () => {
      const tokens = await getTokens();
      if (!tokens) {
        await goToLoginStart();
        return;
      }
      try {
        await goAfterLogin();
      } catch {
        // 출입증이 만료돼 재발급도 실패했거나 서버에 닿지 않으면 처음부터 로그인하게 한다
        await goToLoginStart();
      }
    };
    decideFirstScreen();
  }, []);

  return (
    <View style={styles.screen}>
      {/* 주황 배경 위라 시계·배터리를 흰색으로 (Figma 스플래쉬 화면) */}
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.primary,
  },
});
