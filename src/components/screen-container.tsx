import { BlurTargetView, type BlurViewProps } from 'expo-blur';
import { useRef, useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassHeader } from '@/components/glass-header';

import { colors } from '@/constants/colors';
import { screenPaddingX, spacing } from '@/constants/layout';

type ScreenContainerProps = {
  children: ReactNode;
  /** 화면 맨 위에 고정 (뒤로가기, 진행 표시 등) */
  header?: ReactNode;
  /** 화면 맨 아래에 고정 (다음, 완료 버튼 등) */
  footer?: ReactNode;
  /** 탭 바가 있는 화면은 아래 안전 영역을 탭 바가 처리하므로 false */
  withBottomInset?: boolean;
  /** 흰 카드들을 올리는 화면(마이, 설정)은 회색 배경 */
  background?: 'white' | 'gray';
  /**
   * 머리글과 내용 사이 여백. 기본은 24이고, Figma에서 다른 화면만 바꾼다.
   * 예: 내 기록·기록 상세는 0(머리글 바로 아래), 남기기 2·3단계는 12
   */
  contentTopGap?: number;
  /**
   * 스크롤하면 내용이 머리글 뒤로 흐리게 비쳐 지나가는 반투명 머리글 (Figma: 스크롤이 있는 화면에만).
   * 머리글이 내용 위에 떠 있어서, 내용은 머리글 높이만큼 아래에서 시작한다.
   */
  glassHeader?: boolean;
};

/** 모든 화면의 바깥 틀. 좌우 여백, 안전 영역, 위·아래 고정 영역을 맞춘다. */
export function ScreenContainer({
  children,
  header,
  footer,
  withBottomInset = true,
  background = 'white',
  contentTopGap,
  glassHeader = false,
}: ScreenContainerProps) {
  const blurTarget: NonNullable<BlurViewProps['blurTarget']> = useRef(null);
  const [glassHeaderHeight, setGlassHeaderHeight] = useState(0);
  const topGap = contentTopGap ?? spacing.xl;

  if (glassHeader && header) {
    return (
      <SafeAreaView
        style={[styles.safeArea, background === 'gray' && styles.grayBackground]}
        edges={withBottomInset ? ['bottom'] : []}>
        <BlurTargetView ref={blurTarget} style={styles.blurTarget}>
          <ScrollView
            contentContainerStyle={[styles.content, { paddingTop: glassHeaderHeight + topGap }]}
            keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </BlurTargetView>
        {/* 흐림이 내용보다 나중에 그려져야 안드로이드에서 제대로 흐려진다 */}
        <GlassHeader blurTarget={blurTarget} background={background} onHeightChange={setGlassHeaderHeight}>
          {header}
        </GlassHeader>
        {footer && <View style={styles.footer}>{footer}</View>}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, background === 'gray' && styles.grayBackground]}
      edges={withBottomInset ? ['top', 'bottom'] : ['top']}>
      {header && <View style={styles.header}>{header}</View>}
      <ScrollView
        contentContainerStyle={[styles.content, contentTopGap !== undefined && { paddingTop: contentTopGap }]}
        keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
      {footer && <View style={styles.footer}>{footer}</View>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background01,
  },
  grayBackground: {
    backgroundColor: colors.background02,
  },
  header: {
    paddingHorizontal: screenPaddingX,
    paddingTop: spacing.xs,
  },
  blurTarget: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: screenPaddingX,
    paddingVertical: spacing.xl,
  },
  footer: {
    paddingHorizontal: screenPaddingX,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
});
