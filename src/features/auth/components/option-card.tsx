import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle } from 'react-native-reanimated';

import { AppText } from '@/components/app-text';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/layout';
import { duration } from '@/constants/motion';
import { useTransitionProgress } from '@/hooks/use-transition-progress';

type OptionCardProps = {
  title: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  /** 오른쪽 끝 (예: 체크박스) */
  right?: ReactNode;
  /** 두 칸 격자처럼 좁은 자리에 둘 때 글자를 한 단계 작게 */
  compact?: boolean;
  style?: ViewStyle;
};

/**
 * 설문 선택지 카드. 고르면 연한 주황 배경에 검정 테두리.
 * 설명이 있으면 Figma selectbox_text(두꺼운 테두리, 큰 모서리), 없으면 selectbox_check 모양이다.
 * 고를 때 색이 100ms 동안 서서히 바뀐다 (Figma 프로토타입 selectbox: 디졸브 100ms, Ease out).
 */
export function OptionCard({ title, description, selected, onPress, right, compact = false, style }: OptionCardProps) {
  const progress = useTransitionProgress(selected, duration.press);
  const selectStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(progress.get(), [0, 1], [colors.borderDeactivated, colors.textPrimary]),
    backgroundColor: interpolateColor(progress.get(), [0, 1], [colors.background01, colors.selectedBackground]),
  }));

  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={style}>
      <Animated.View style={[styles.card, description ? styles.textCard : styles.checkCard, selectStyle]}>
        <View style={styles.texts}>
          <AppText variant={compact ? 'subtitle04' : 'subtitle03'}>{title}</AppText>
          {description && (
            <AppText variant={compact ? 'caption04' : 'caption02'} color="textSecondary">
              {description}
            </AppText>
          )}
        </View>
        {right}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // 두 칸 격자에서 옆 카드와 높이를 맞추려고 감싸는 칸을 꽉 채운다
  card: {
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  textCard: {
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
  },
  checkCard: {
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  texts: {
    flex: 1,
    gap: spacing.xxs,
  },
});
