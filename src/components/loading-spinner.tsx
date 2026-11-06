import { Image } from 'expo-image';
import { useEffect } from 'react';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { duration } from '@/constants/motion';

const arcImage = require('@/assets/icons/loading-arc.svg');

// Figma 'Component 14' 로딩 동그라미 크기
const spinnerSize = 22;
// Figma 프로토타입: 4장면을 300ms씩(Linear) 넘기며 시계 반대 방향으로 한 바퀴 돈다 → 한 바퀴 1.2초
const turnMs = duration.screen * 4;

/**
 * 기다리는 동안 버튼 안에서 도는 동그라미 (Figma 사진 올릴 때 로딩).
 * Figma는 4장면을 이어 붙여 돌게 했는데, 장면마다 도는 각도가 달라 끊겨 보일 수 있어서
 * 앱은 같은 1.2초에 일정한 속도로 계속 돌린다.
 */
export function LoadingSpinner() {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.set(withRepeat(withTiming(-360, { duration: turnMs, easing: Easing.linear }), -1));
    return () => cancelAnimation(rotation);
  }, [rotation]);

  const spinStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.get()}deg` }] }));

  return (
    <Animated.View accessibilityLabel="기다리는 중" style={spinStyle}>
      <Image source={arcImage} style={{ width: spinnerSize, height: spinnerSize }} />
    </Animated.View>
  );
}
