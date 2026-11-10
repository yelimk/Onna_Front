import { Pressable, StyleSheet } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle } from 'react-native-reanimated';

import { AppText } from '@/components/app-text';
import { Icon } from '@/components/icon';
import { colors } from '@/constants/colors';
import { floatingShadow, radius, spacing } from '@/constants/layout';
import { duration } from '@/constants/motion';
import { useTransitionProgress } from '@/hooks/use-transition-progress';

type ExploreModeToggleProps = {
  value: boolean;
  onChange: (value: boolean) => void;
};

const knobSize = 22;
/** 손잡이가 움직이는 거리: 손잡이 한 칸 + 손잡이와 눈 아이콘 사이 간격 */
const knobTravel = knobSize + spacing.xxs;

/**
 * 지도 오른쪽 위 '탐색 모드' 스위치.
 * 손잡이 반대편에 눈 아이콘을 둔다: 꺼지면 감은 눈(회색), 켜지면 뜬 눈(주황 바탕에 흰색).
 * 켜고 끌 때 손잡이가 미끄러지고, 바탕색과 눈 아이콘이 함께 서서히 바뀐다 (QA: 탐색모드 토글 애니메이션).
 * Figma에는 켜짐·꺼짐 두 모양만 있어서, 다른 '켜짐·고름' 전환과 같은 길이(duration.change)로 움직인다.
 */
export function ExploreModeToggle({ value, onChange }: ExploreModeToggleProps) {
  const progress = useTransitionProgress(value, duration.change);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.get(), [0, 1], [colors.borderDeactivated, colors.primary]),
  }));
  const knobStyle = useAnimatedStyle(() => ({ transform: [{ translateX: progress.get() * knobTravel }] }));
  // 꺼짐: 손잡이 왼쪽 + 감은 눈 오른쪽 / 켜짐: 뜬 눈 왼쪽 + 손잡이 오른쪽. 두 눈을 제자리에서 겹쳐 바꾼다.
  const closedEyeStyle = useAnimatedStyle(() => ({ opacity: 1 - progress.get() }));
  const openEyeStyle = useAnimatedStyle(() => ({ opacity: progress.get() }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel="탐색 모드"
      accessibilityState={{ checked: value }}
      hitSlop={spacing.xs}
      onPress={() => onChange(!value)}
      style={styles.container}>
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.iconSlot, styles.openEyeSlot, openEyeStyle]}>
          <Icon name="eyeOpen" size={20} color="textInverse" />
        </Animated.View>
        <Animated.View style={[styles.iconSlot, styles.closedEyeSlot, closedEyeStyle]}>
          <Icon name="eyeClosed" size={20} color="textDeactivated" />
        </Animated.View>
        <Animated.View style={[styles.knob, knobStyle]} />
      </Animated.View>
      <AppText variant="caption03" color={value ? 'primary' : 'textDeactivated'}>
        탐색 모드
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.xxs,
  },
  // 손잡이와 눈 아이콘이 한 줄에 놓이는 크기 (손잡이 + 간격 + 아이콘 + 안쪽 여백)
  track: {
    ...floatingShadow,
    width: knobSize * 2 + spacing.xxs * 3,
    height: knobSize + spacing.xxs * 2,
    padding: spacing.xxs,
    borderRadius: radius.full,
  },
  knob: {
    width: knobSize,
    height: knobSize,
    borderRadius: radius.full,
    backgroundColor: colors.background01,
  },
  iconSlot: {
    position: 'absolute',
    top: spacing.xxs,
    width: knobSize,
    height: knobSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openEyeSlot: {
    left: spacing.xxs,
  },
  closedEyeSlot: {
    right: spacing.xxs,
  },
});
