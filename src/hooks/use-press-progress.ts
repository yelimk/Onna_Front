import { useState } from 'react';
import type { GestureResponderEvent } from 'react-native';

import { useTransitionProgress } from '@/hooks/use-transition-progress';

type PressHandlers = {
  onPressIn?: (event: GestureResponderEvent) => void;
  onPressOut?: (event: GestureResponderEvent) => void;
};

/**
 * 누르고 있는 동안 0 → 1, 떼면 1 → 0으로 ms 동안 서서히 움직이는 값 (Figma pressed 디졸브).
 * Pressable의 style({ pressed })은 눌림 모양을 바로 바꿔서, 서서히 바꾸려면 눌림 여부를 따로 들고 있어야 한다.
 * 받은 onPressIn/onPressOut도 같이 불러 주므로 Pressable에 그대로 넘기면 된다.
 */
export function usePressProgress(ms: number, handlers: PressHandlers = {}) {
  const [isPressed, setIsPressed] = useState(false);
  const progress = useTransitionProgress(isPressed, ms);

  const pressHandlers = {
    onPressIn: (event: GestureResponderEvent) => {
      setIsPressed(true);
      handlers.onPressIn?.(event);
    },
    onPressOut: (event: GestureResponderEvent) => {
      setIsPressed(false);
      handlers.onPressOut?.(event);
    },
  };

  return { progress, isPressed, pressHandlers };
}
