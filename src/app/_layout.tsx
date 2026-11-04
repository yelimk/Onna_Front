import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { Fragment, useEffect } from 'react';

import { ToastHost } from '@/components/toast';
import { colors } from '@/constants/colors';
import { fontFiles } from '@/constants/typography';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts(fontFiles);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <Fragment>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background01 } }}>
        {/* 남기기와 열림 순간은 탭 바 없이 전체 화면, 신고는 아래에서 올라오는 모달 */}
        <Stack.Screen name="upload" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="opening/[id]" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
        <Stack.Screen name="report/[id]" options={{ presentation: 'modal' }} />
        {/* 사진 카드는 지도 위를 어둡게 덮고 탭 바까지 가리는 투명 모달 */}
        <Stack.Screen
          name="photo/[id]"
          options={{ presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }}
        />
      </Stack>
      {/* 기본은 흰 화면 위 검은 시계·배터리. 주황 시작 화면, 검은 촬영 화면만 각자 흰색으로 바꾼다. */}
      <StatusBar style="dark" />
      {/* 모든 화면 위에 토스트를 띄우려고 화면 묶음(Stack) 바깥 맨 위에 둔다 */}
      <ToastHost />
    </Fragment>
  );
}
