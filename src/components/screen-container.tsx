import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { colors } from '@/constants/colors';
import { screenPaddingX, spacing } from '@/constants/layout';
import { useScreenInsets } from '@/hooks/use-screen-insets';

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
};

/** 모든 화면의 바깥 틀. 좌우 여백, 안전 영역, 위·아래 고정 영역을 맞춘다. */
export function ScreenContainer({
  children,
  header,
  footer,
  withBottomInset = true,
  background = 'white',
  contentTopGap,
}: ScreenContainerProps) {
  // 안전 영역을 이 화면이 직접 재지 않고 앱이 켜질 때 잰 값과 맞춰 쓴다 (아이폰 남기기 창에서 위가 안 비던 문제, use-screen-insets.ts)
  const insets = useScreenInsets();

  return (
    <View
      style={[
        styles.safeArea,
        background === 'gray' && styles.grayBackground,
        { paddingTop: insets.top, paddingBottom: withBottomInset ? insets.bottom : 0 },
      ]}>
      {header && <View style={styles.header}>{header}</View>}
      <ScrollView
        contentContainerStyle={[styles.content, contentTopGap !== undefined && { paddingTop: contentTopGap }]}
        keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
      {footer && <View style={styles.footer}>{footer}</View>}
    </View>
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
