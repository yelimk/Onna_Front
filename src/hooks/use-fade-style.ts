import { useEffect } from 'react';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

/**
 * isVisible이 바뀌면 duration 동안 흐려지거나 진해지는 스타일. Animated.View에 넣는다.
 * 처음 그릴 때는 애니메이션 없이 바로 그 상태로 시작한다.
 */
export function useFadeStyle(isVisible: boolean, duration: number) {
  const opacity = useSharedValue(isVisible ? 1 : 0);

  useEffect(() => {
    opacity.set(withTiming(isVisible ? 1 : 0, { duration }));
  }, [isVisible, duration, opacity]);

  return useAnimatedStyle(() => ({ opacity: opacity.get() }));
}
