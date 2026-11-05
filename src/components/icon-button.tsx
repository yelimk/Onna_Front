import { Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { Icon, type IconName } from '@/components/icon';
import { colors } from '@/constants/colors';
import { floatingShadow, radius } from '@/constants/layout';
import { duration } from '@/constants/motion';
import { usePressProgress } from '@/hooks/use-press-progress';

type IconButtonProps = {
  icon: IconName;
  accessibilityLabel: string;
  onPress?: () => void;
  /** 카메라처럼 눈에 띄어야 하는 버튼 */
  emphasized?: boolean;
  size?: number;
  /**
   * 누르고 있을 때 옅은 회색이 되는지. Figma에서 눌림 모양이 있는 버튼(알림 종 bell_circle)만 켠다.
   * 지도 뒤로가기(arrow_left_circle)처럼 눌림 모양이 없는 버튼은 그대로 둔다.
   * 회색은 180ms 동안 서서히 덮인다 (Figma 프로토타입 bell_circle pressed: 디졸브 180ms, Ease out).
   */
  showPressed?: boolean;
};

/** 지도 위에 떠 있는 동그란 아이콘 버튼 */
export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  emphasized = false,
  size = 44,
  showPressed = false,
}: IconButtonProps) {
  const { progress, pressHandlers } = usePressProgress(duration.change);
  const pressedStyle = useAnimatedStyle(() => ({ opacity: showPressed ? progress.get() : 0 }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      {...pressHandlers}
      style={[styles.button, { width: size, height: size }, emphasized && styles.emphasized]}>
      {/* 흰 동그라미 위에 회색 동그라미를 겹쳐 두고 투명도만 바꾼다. 아이콘은 회색 위에 그대로 보인다 */}
      <Animated.View pointerEvents="none" style={[styles.pressed, pressedStyle]} />
      <Icon name={icon} size={size / 2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    ...floatingShadow,
    borderRadius: radius.full,
    backgroundColor: colors.background01,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emphasized: {
    backgroundColor: colors.primary,
  },
  pressed: {
    ...StyleSheet.absoluteFill,
    borderRadius: radius.full,
    backgroundColor: colors.pressedCircleButton,
  },
});
