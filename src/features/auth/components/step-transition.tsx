import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeOut, type EasingFunction, type EasingFunctionFactory } from 'react-native-reanimated';

import { duration, easeOut } from '@/constants/motion';

type StepTransitionProps = {
  /** 이 값이 바뀌면 이전 내용은 서서히 사라지고 새 내용이 서서히 나타난다 (예: 단계 번호) */
  stepKey: number;
  /** false면 나타날 때 움직이지 않는다. 화면에 처음 들어왔을 때 바로 보이게 할 때 쓴다 */
  animate: boolean;
  easing?: EasingFunction | EasingFunctionFactory;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

/**
 * 소개·설문·회원가입에서 단계가 바뀔 때의 움직임 (Figma 프로토타입 '다음': 스마트 애니메이트 300ms).
 * Figma 스마트 애니메이트는 두 화면에서 같은 요소를 찾아 이어 주지만, 앱에는 그런 기능이 없다.
 * 그래서 바뀌는 내용 전체를 같은 시간·곡선으로 겹쳐서 서서히 바꾸는(크로스페이드) 것으로 대신한다.
 * 진행 점·진행바처럼 단계마다 그대로 있는 부분은 이 밖에 두고 따로 움직인다.
 */
export function StepTransition({ stepKey, animate, easing = easeOut, style, children }: StepTransitionProps) {
  return (
    <Animated.View
      key={stepKey}
      entering={animate ? FadeIn.duration(duration.screen).easing(easing) : undefined}
      // 사라지는 움직임은 첫 단계에도 있어야 해서 늘 켠다 (사라질 때는 이전 값을 보기 때문)
      exiting={FadeOut.duration(duration.screen).easing(easing)}
      style={style}>
      {children}
    </Animated.View>
  );
}
