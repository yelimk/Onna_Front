import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { colors } from '@/constants/colors';
import { floatingShadow, radius } from '@/constants/layout';

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
   */
  showPressed?: boolean;
  /** 아이콘 오른쪽 위 빨간 점 (마이 탭 알림 종: 새 알림이 있을 때). Figma에 없어서 디자이너 확인 중 */
  showDot?: boolean;
};

// 알림 목록의 새 알림 점과 같은 크기
const dotSize = 8;

/** 지도 위에 떠 있는 동그란 아이콘 버튼 */
export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  emphasized = false,
  size = 44,
  showPressed = false,
  showDot = false,
}: IconButtonProps) {
  // 아이콘(버튼의 절반 크기)의 오른쪽 위 모서리에 점이 걸치게 둔다
  const dotOffset = size / 4 - dotSize / 4;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { width: size, height: size },
        emphasized && styles.emphasized,
        pressed && showPressed && styles.pressed,
      ]}>
      <Icon name={icon} size={size / 2} />
      {showDot && <View style={[styles.dot, { top: dotOffset, right: dotOffset }]} />}
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
    backgroundColor: colors.pressedCircleButton,
  },
  dot: {
    position: 'absolute',
    width: dotSize,
    height: dotSize,
    borderRadius: radius.full,
    backgroundColor: colors.error,
  },
});
