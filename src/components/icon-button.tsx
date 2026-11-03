import { Pressable, StyleSheet } from 'react-native';

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
});
