import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { getTokens } from '@/api/token-storage';
import { colors } from '@/constants/colors';
import { goAfterLogin } from '@/features/auth/utils/go-after-login';

/**
 * 앱을 켜면 처음 지나는 화면. 저장된 출입증이 있으면 로그인 화면을 건너뛰고 바로 들어간다.
 * 확인하는 짧은 동안 스플래시와 같은 주황 화면을 보여줘서 화면이 깜빡이지 않게 한다.
 */
export function StartScreen() {
  useEffect(() => {
    const decideFirstScreen = async () => {
      const tokens = await getTokens();
      if (!tokens) {
        router.replace('/intro');
        return;
      }
      try {
        await goAfterLogin();
      } catch {
        // 출입증이 만료돼 재발급도 실패했거나 서버에 닿지 않으면 처음부터 로그인하게 한다
        router.replace('/intro');
      }
    };
    decideFirstScreen();
  }, []);

  return <View style={styles.screen} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.primary,
  },
});
