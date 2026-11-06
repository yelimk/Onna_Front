import { Pressable, StyleSheet } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle } from 'react-native-reanimated';

import { AnimatedAppText } from '@/components/app-text';
import { Icon, type IconName } from '@/components/icon';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/layout';
import { duration } from '@/constants/motion';
import { useTransitionProgress } from '@/hooks/use-transition-progress';

type ChipProps = {
  label: string;
  selected?: boolean;
  icon?: IconName;
  onPress?: () => void;
};

/**
 * Figma 기록탭 hashtag. 해시태그·필터·최근 검색어처럼 동그란 작은 버튼. 고르면 검정으로 바뀐다.
 * 색은 100ms 동안 서서히 바뀐다 (Figma 프로토타입 고르기: 100ms, Ease out).
 */
export function Chip({ label, selected = false, icon, onPress }: ChipProps) {
  const progress = useTransitionProgress(selected, duration.press);
  const chipStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.get(), [0, 1], [colors.background02, colors.textPrimary]),
  }));
  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.get(), [0, 1], [colors.textPrimary, colors.textInverse]),
  }));

  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress}>
      <Animated.View style={[styles.chip, chipStyle]}>
        {/* 아이콘은 그림이라 색을 섞을 수 없어서 바로 바꾼다 */}
        {icon && <Icon name={icon} size={16} color={selected ? 'textInverse' : undefined} />}
        <AnimatedAppText variant={selected ? 'button03' : 'button04'} style={labelStyle}>
          {label}
        </AnimatedAppText>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
});
