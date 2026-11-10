import {
  walkDurationMinutes,
  walkDurationOptions,
  walkTimeOptions,
  walkTimeStyles,
  type WalkDuration,
  type WalkTime,
} from '@/constants/walk-options';
import type { WalkPreference } from '@/types/api';

/** 화면에서 고른 걷는 때·시간 → 서버로 보낼 값. 온보딩과 사용자 기호 설정이 같이 쓴다 */
export function toWalkPreference(walkTimes: WalkTime[], walkDuration: WalkDuration) {
  return {
    styles: walkTimes.map((time) => walkTimeStyles[time]),
    minutes: walkDurationMinutes[walkDuration],
  };
}

/** 서버에서 받은 걷는 방식·시간 → 화면 보기. 고르기 전이면 빈 목록과 undefined */
export function fromWalkPreference({ styles, minutes }: WalkPreference) {
  return {
    walkTimes: walkTimeOptions.filter((time) => styles.includes(walkTimeStyles[time])),
    walkDuration: walkDurationOptions.find((duration) => walkDurationMinutes[duration] === minutes),
  };
}
