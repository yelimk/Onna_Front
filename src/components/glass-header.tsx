import { BlurView, type BlurViewProps } from 'expo-blur';
import type { ReactNode } from 'react';
import { StyleSheet, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors';
import { screenPaddingX, spacing } from '@/constants/layout';

// Figma 상단 바 background blur 20. 앱 흐림 세기(1~100)는 단위가 달라 그대로 옮길 수 없어서 중간값으로 두었다. 폰에서 보고 맞춘다.
const blurIntensity = 40;

type GlassHeaderProps = {
  children: ReactNode;
  /** 흐리게 비칠 아래 내용(안드로이드는 이 칸 안의 내용만 흐릴 수 있다) */
  blurTarget: BlurViewProps['blurTarget'];
  background: 'white' | 'gray';
  onHeightChange: (height: number) => void;
};

/**
 * 스크롤하면 내용이 비쳐 보이는 반투명 상단 바 (Figma: 배경색 40% + background blur 20).
 * 상태 표시줄 자리까지 덮어서, 시계 아래로 내용이 흐리게 지나간다.
 */
export function GlassHeader({ children, blurTarget, background, onHeightChange }: GlassHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <BlurView
      intensity={blurIntensity}
      blurTarget={blurTarget}
      blurMethod="dimezisBlurViewSdk31Plus"
      onLayout={(event: LayoutChangeEvent) => onHeightChange(event.nativeEvent.layout.height)}
      style={[
        styles.bar,
        { paddingTop: insets.top + spacing.xs },
        { backgroundColor: background === 'gray' ? colors.glassGray : colors.glassWhite },
      ]}>
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: screenPaddingX,
  },
});
