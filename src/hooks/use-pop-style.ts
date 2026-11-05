import { useEffect, useRef } from 'react';
import { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { duration } from '@/constants/motion';

/** 톡 튀어 오를 때 가장 커지는 배율 */
const popScale = 1.3;

/**
 * isOn이 꺼짐 → 켜짐으로 바뀔 때만 한 번 톡 커졌다 돌아오는 스타일 (좋아요 하트, 약관 체크 등).
 * 화면을 열 때 이미 켜져 있던 것은 튀지 않는다. 사용자가 방금 누른 것만 알려 주려는 것이다.
 * 지도 사진 카드의 하트(features/map/hooks/use-pop-style.ts)와 같은 움직임이다. 지도 담당과 코드 정리할 때 하나로 합친다.
 */
export function usePopStyle(isOn: boolean) {
  const scale = useSharedValue(1);
  const wasOn = useRef(isOn);

  useEffect(() => {
    if (isOn && !wasOn.current) {
      scale.set(
        withSequence(withTiming(popScale, { duration: duration.fast }), withTiming(1, { duration: duration.fast })),
      );
    }
    wasOn.current = isOn;
  }, [isOn, scale]);

  return useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
}
