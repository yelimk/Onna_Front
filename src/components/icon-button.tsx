import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { Icon, type IconName } from '@/components/icon';
import { colors, type ColorName } from '@/constants/colors';
import { floatingShadow, radius, softShadow } from '@/constants/layout';
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
  /**
   * 그림자 모양. floating: 지도 위에 떠 있는 버튼(기본), soft: 흰 바탕 위 버튼처럼 옅게 퍼지는 그림자(Figma 마이 알림 종)
   */
  shadow?: 'floating' | 'soft';
  /** 아이콘 크기. 기본은 버튼의 절반 (Figma 마이 알림 종은 48 버튼에 26 아이콘) */
  iconSize?: number;
  /** 오른쪽 위 빨간 점 (예: 새 알림). 점 테두리는 버튼이 놓인 바탕색과 같게 칠해서 버튼과 떨어져 보이게 한다 */
  badgeOutlineColor?: ColorName;
  showBadge?: boolean;
};

// Figma 마이 알림 종: 점 12(바탕색 테두리 2 포함) 안에 빨간 점 8, 버튼 오른쪽 위에서 1씩 안쪽
const badgeSize = 12;
const badgeDotSize = 8;
const badgeInset = 1;

/** 지도 위에 떠 있는 동그란 아이콘 버튼 */
export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  emphasized = false,
  size = 44,
  showPressed = false,
  shadow = 'floating',
  iconSize,
  showBadge = false,
  badgeOutlineColor = 'background01',
}: IconButtonProps) {
  const { progress, pressHandlers } = usePressProgress(duration.change);
  const pressedStyle = useAnimatedStyle(() => ({ opacity: showPressed ? progress.get() : 0 }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      {...pressHandlers}
      style={[
        styles.button,
        shadow === 'soft' ? softShadow : floatingShadow,
        { width: size, height: size },
        emphasized && styles.emphasized,
      ]}>
      {/* 흰 동그라미 위에 회색 동그라미를 겹쳐 두고 투명도만 바꾼다. 아이콘은 회색 위에 그대로 보인다 */}
      <Animated.View pointerEvents="none" style={[styles.pressed, pressedStyle]} />
      <Icon name={icon} size={iconSize ?? size / 2} />
      {showBadge && (
        <View pointerEvents="none" style={[styles.badge, { backgroundColor: colors[badgeOutlineColor] }]}>
          <View style={styles.badgeDot} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.full,
    backgroundColor: colors.background01,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emphasized: {
    backgroundColor: colors.primary,
  },
  badge: {
    position: 'absolute',
    top: badgeInset,
    right: badgeInset,
    width: badgeSize,
    height: badgeSize,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDot: {
    width: badgeDotSize,
    height: badgeDotSize,
    borderRadius: radius.full,
    backgroundColor: colors.error,
  },
  pressed: {
    ...StyleSheet.absoluteFill,
    borderRadius: radius.full,
    backgroundColor: colors.pressedCircleButton,
  },
});
