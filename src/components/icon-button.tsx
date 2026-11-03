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
};

/** 지도 위에 떠 있는 동그란 아이콘 버튼 */
export function IconButton({ icon, accessibilityLabel, onPress, emphasized = false, size = 44 }: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { width: size, height: size },
        emphasized && styles.emphasized,
        pressed && !emphasized && styles.pressed,
      ]}>
      {({ pressed }) => (
        <>
          {/* 주황 버튼은 색을 바꾸지 않고 어두운 막을 덮는다 (큰 버튼 Button의 눌림과 같은 방식) */}
          {pressed && emphasized && <View style={styles.pressedOverlay} />}
          <Icon name={icon} size={size / 2} />
        </>
      )}
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
  // 누르고 있으면 흰 동그라미가 옅은 회색이 된다 (Figma bell_circle pressed)
  pressed: {
    backgroundColor: colors.pressedCircleButton,
  },
  pressedOverlay: {
    ...StyleSheet.absoluteFill,
    borderRadius: radius.full,
    backgroundColor: colors.pressedOverlay,
  },
});
