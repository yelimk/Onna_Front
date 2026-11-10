import type { WalkMinutes, WalkStyle } from '@/types/api';

/**
 * 걷는 때·한번에 걷는 시간 보기. 온보딩 취향 설문과 마이 탭 사용자 기호 설정이 같은 보기를 써서 src/constants에 둔다.
 * 화면은 GUI 문구 그대로 다루고, 서버에 보내고 받을 때만 아래 짝으로 바꾼다 (utils/walk-preference.ts).
 */
export const walkTimeOptions = ['등하굣길', '공강 시간', '저녁 산책', '러닝할 때', '주말 나들이'] as const;
export type WalkTime = (typeof walkTimeOptions)[number];

export const walkDurationOptions = ['10분', '20분', '30분 이상'] as const;
export type WalkDuration = (typeof walkDurationOptions)[number];

/** 걷는 때 보기 ↔ 서버 걷는 방식 */
export const walkTimeStyles: Record<WalkTime, WalkStyle> = {
  등하굣길: 'COMMUTE',
  '공강 시간': 'BREAK',
  '저녁 산책': 'EVENING',
  '러닝할 때': 'RUNNING',
  '주말 나들이': 'WEEKEND',
};

/** 한번에 걷는 시간 보기 ↔ 서버 분 */
export const walkDurationMinutes: Record<WalkDuration, WalkMinutes> = {
  '10분': 10,
  '20분': 20,
  '30분 이상': 30,
};
