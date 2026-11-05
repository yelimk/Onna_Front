import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { colors } from '@/constants/colors';
import { radius } from '@/constants/layout';
import { duration, easeOut } from '@/constants/motion';

type StepProgressProps = {
  step: number;
  totalSteps: number;
};

/**
 * 설문·회원가입 머리 아래 진행 막대. 지금 단계만큼 검정으로 채운다.
 * 단계가 바뀌면 검정 막대가 300ms 동안 늘어나거나 줄어든다 (Figma 프로토타입 '다음': 스마트 애니메이트 300ms, Ease out).
 * 퍼센트 너비는 움직일 수 없어서, 막대 칸 너비를 재서 그만큼의 숫자로 늘린다.
 */
export function StepProgress({ step, totalSteps }: StepProgressProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const ratio = useSharedValue(step / totalSteps);

  useEffect(() => {
    ratio.set(withTiming(step / totalSteps, { duration: duration.screen, easing: easeOut }));
  }, [step, totalSteps, ratio]);

  const fillStyle = useAnimatedStyle(() => ({ width: trackWidth * ratio.get() }));

  return (
    <View style={styles.track} onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}>
      <Animated.View style={[styles.fill, fillStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  // Figma 설문·회원가입: 진행 막대는 화면 머리(56) 맨 아래 4에 겹쳐 있다
  track: {
    height: 4,
    marginTop: -4,
    borderRadius: radius.xs,
    backgroundColor: colors.disabledBackground,
  },
  fill: {
    height: 4,
    borderRadius: radius.xs,
    backgroundColor: colors.textPrimary,
  },
});
