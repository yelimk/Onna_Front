import type { ReactNode } from 'react';
import { Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { colors, type ColorName } from '@/constants/colors';
import { duration } from '@/constants/motion';
import { usePressProgress } from '@/hooks/use-press-progress';

type PressHighlightProps = Omit<PressableProps, 'style' | 'children'> & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** 누르고 있을 때 깔리는 색 */
  pressedColor?: ColorName;
  /** 색이 깔리는 시간 */
  ms?: number;
};

/**
 * 누르고 있으면 뒤에 옅은 회색이 서서히 깔리는 누름 영역 (Figma pressed 디졸브 100ms).
 * 기록 상세 휴지통, 삭제 확인 창의 '취소·삭제'처럼 글자·아이콘은 그대로 두고 바탕만 바뀌는 곳에 쓴다.
 * 회색 판을 맨 뒤에 깔고 투명도만 바꾼다. 모서리 밖으로 넘치지 않게 잘라 낸다.
 */
export function PressHighlight({
  children,
  style,
  pressedColor = 'background02',
  ms = duration.press,
  onPressIn,
  onPressOut,
  ...rest
}: PressHighlightProps) {
  const { progress, pressHandlers } = usePressProgress(ms, { onPressIn, onPressOut });
  const highlightStyle = useAnimatedStyle(() => ({ opacity: progress.get() }));

  return (
    <Pressable style={[styles.clip, style]} {...pressHandlers} {...rest}>
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: colors[pressedColor] }, highlightStyle]}
      />
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
  },
});
