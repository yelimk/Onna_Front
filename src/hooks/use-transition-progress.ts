import { useEffect } from 'react';
import { useSharedValue, withTiming, type EasingFunction, type EasingFunctionFactory } from 'react-native-reanimated';

import { easeOut } from '@/constants/motion';

/**
 * isOn이 바뀌면 0 ↔ 1로 서서히 움직이는 값. 눌림·고름·켜짐 같은 두 모양 사이를 Figma 디졸브처럼 서서히 바꿀 때 쓴다.
 * 모양마다 색·투명도를 따로 움직이지 않고 이 값 하나로 interpolateColor 등을 해서 박자를 맞춘다.
 * 처음 그릴 때는 움직이지 않고 그 상태로 시작한다.
 */
export function useTransitionProgress(isOn: boolean, ms: number, easing: EasingFunction | EasingFunctionFactory = easeOut) {
  const progress = useSharedValue(isOn ? 1 : 0);

  useEffect(() => {
    progress.set(withTiming(isOn ? 1 : 0, { duration: ms, easing }));
  }, [isOn, ms, easing, progress]);

  return progress;
}
