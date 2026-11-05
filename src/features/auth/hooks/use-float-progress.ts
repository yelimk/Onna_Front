import { useEffect } from 'react';
import { Easing, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { duration } from '@/constants/motion';

/**
 * 0 → 1 → 0을 끝없이 오가는 값. 소개 그림이 둥둥 떠 있는 움직임에 쓴다.
 * Figma는 처음(0)과 끝(1) 두 프레임만 있어서, 그 사이를 부드럽게 왔다 갔다 하게 만든다.
 * 그림과 그림자가 같은 값을 보고 움직여야 박자가 맞아서, 값 하나를 만들어 같이 쓴다.
 */
export function useFloatProgress() {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.set(withRepeat(withTiming(1, { duration: duration.float, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [progress]);

  return progress;
}
