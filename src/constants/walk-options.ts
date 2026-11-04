/**
 * 걷는 때·한번에 걷는 시간 보기. 온보딩 취향 설문과 마이 탭 사용자 기호 설정이 같은 보기를 써서 src/constants에 둔다.
 */
export const walkTimeOptions = ['등하굣길', '공강 시간', '저녁 산책', '러닝할 때', '주말 나들이'] as const;
export type WalkTime = (typeof walkTimeOptions)[number];

export const walkDurationOptions = ['10분', '20분', '30분 이상'] as const;
export type WalkDuration = (typeof walkDurationOptions)[number];
