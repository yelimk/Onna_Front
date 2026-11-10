import { FadeIn, FadeInUp } from 'react-native-reanimated';

import type { ColorName } from '@/constants/colors';
import { duration, easeOut } from '@/constants/motion';

/*
 * TextField 아래 안내 문구(빨간 오류, 초록 성공, 회색 안내)의 색과 나타나는 움직임.
 * 입력칸 본체와 따로 바뀌는 Figma 규칙이라 나눠 둔다.
 */

// Figma 회원가입 '사용할 수 있어요': 입력칸 바로 밑(24 위)에 투명하게 있다가 0.1초 뒤 300ms 동안 내려오며 나타난다
const successHelperDrop = 24;
const successHelperDelay = 100;

/**
 * 안내 문구가 나타나는 움직임. Figma 프로토타입 값:
 * - 초록 문구('사용할 수 있어요', '비밀번호가 일치합니다'): 0.1초 뒤 위에서 24 내려오며 나타남 (스마트 애니메이트 300ms, Ease out)
 * - 빨간 문구: 빨간 테두리와 같이 180ms
 * - 회색 안내: Figma에 없어서 빨간 문구와 같이 둔다
 */
export function getHelperEntering(error: string | undefined, success: string | undefined) {
  if (error === undefined && success !== undefined) {
    return FadeInUp.withInitialValues({ opacity: 0, transform: [{ translateY: -successHelperDrop }] })
      .delay(successHelperDelay)
      .duration(duration.screen)
      .easing(easeOut);
  }
  return FadeIn.duration(duration.change);
}

export function getHelperColor(error: string | undefined, success: string | undefined): ColorName {
  if (error !== undefined) return 'error';
  if (success !== undefined) return 'success';
  return 'textTertiary';
}
