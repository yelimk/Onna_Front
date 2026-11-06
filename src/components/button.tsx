import { Pressable, StyleSheet, type PressableProps, type ViewStyle } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle } from 'react-native-reanimated';

import { AnimatedAppText } from '@/components/app-text';
import { Icon, type IconName } from '@/components/icon';
import { colors, type ColorName } from '@/constants/colors';
import { radius, spacing } from '@/constants/layout';
import { duration } from '@/constants/motion';
import { usePressProgress } from '@/hooks/use-press-progress';

type ButtonVariant = 'primary' | 'dark' | 'outline';

type ButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  label: string;
  variant?: ButtonVariant;
  /** 글자 왼쪽 아이콘 */
  icon?: IconName;
  style?: ViewStyle;
};

const labelColor: Record<ButtonVariant, ColorName> = {
  primary: 'textInverse',
  dark: 'textInverse',
  outline: 'textPrimary',
};

/**
 * Figma 공통 컴포넌트 button. primary(주황)는 강조, dark(검정)는 기본 진행, outline은 보조 동작.
 * 누르고 있으면 버튼 위에 어두운 막을 덮고 글자를 회색으로 바꾼다 (Figma default_pressed, black_pressed).
 * 눌림 모양은 Figma 프로토타입처럼 100ms 동안 서서히 바뀐다 (디졸브, Ease out).
 * 비활성이면 어떤 버튼이든 회색 배경에 흰 글자 (Figma deactivated).
 */
export function Button({ label, variant = 'dark', icon, disabled, style, onPressIn, onPressOut, ...rest }: ButtonProps) {
  const { progress, isPressed, pressHandlers } = usePressProgress(duration.press, { onPressIn, onPressOut });
  // outline 버튼은 Figma에 눌림 모양이 없다
  const hasPressedLook = !disabled && variant !== 'outline';
  const baseColorName: ColorName = disabled ? 'textInverse' : labelColor[variant];
  const baseTextColor = colors[baseColorName];
  // 아이콘은 그림이라 색을 서서히 바꿀 수 없어서 눌림에 맞춰 바로 바꾼다
  const iconColor: ColorName = hasPressedLook && isPressed ? 'textDeactivated' : baseColorName;

  const overlayStyle = useAnimatedStyle(() => ({ opacity: hasPressedLook ? progress.get() : 0 }));
  const textStyle = useAnimatedStyle(() => ({
    color: hasPressedLook
      ? interpolateColor(progress.get(), [0, 1], [baseTextColor, colors.textDeactivated])
      : baseTextColor,
  }));

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={[styles.base, styles[variant], disabled && styles.disabled, style]}
      {...pressHandlers}
      {...rest}>
      <Animated.View pointerEvents="none" style={[styles.pressedOverlay, overlayStyle]} />
      {icon && <Icon name={icon} size={18} color={iconColor} />}
      <AnimatedAppText variant="button01" style={textStyle}>
        {label}
      </AnimatedAppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    flexDirection: 'row',
    gap: spacing.xxs,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  dark: {
    backgroundColor: colors.textPrimary,
  },
  outline: {
    backgroundColor: colors.background01,
    borderWidth: 1,
    borderColor: colors.borderDeactivated,
  },
  disabled: {
    backgroundColor: colors.borderDeactivated,
    borderWidth: 0,
  },
  pressedOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.pressedOverlay,
  },
});
