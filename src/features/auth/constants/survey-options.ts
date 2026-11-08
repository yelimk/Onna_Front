import type { WalkDuration, WalkTime } from '@/constants/walk-options';
import type { RegionRelation } from '@/types/api';

/** 온보딩 설문 선택지. GUI 설문 1/3~3/3 문구 그대로. 첫 추천의 근거가 된다. */

export type RelationOption = {
  /** 서버에 그대로 보내는 값이라 서버 이름(NATIVE 등)을 id로 쓴다 */
  id: RegionRelation;
  title: string;
  description: string;
};

export const relationOptions: RelationOption[] = [
  { id: 'NATIVE', title: '토박이에요', description: '대구·경북 토박이에요. 익숙한 곳을 새로 보고 싶어요' },
  { id: 'MOVED_IN', title: '대구·경북으로 왔어요', description: '학교나 일 때문에 와서 지내고 있어요' },
  { id: 'VISITING', title: '잠깐 머무는 중이에요', description: '여행이나 짧은 일정으로 왔어요' },
];

/**
 * 끌리는 자리 카드의 작은 설명. 태그 목록은 서버(/tags)에서 오고, 이름이 같은 태그에만 설명을 붙인다.
 * 서버 태그에는 설명이 없어서 GUI 문구를 앱에 남겨 둔다.
 */
export const placeDescriptions: Record<string, string> = {
  '#말없이챙겨준': '무뚝뚝한 배려',
  '#덤': '계산 밖의 호의',
  '#밥뭇나': '걱정 섞인 안부',
  '#단골자리': '매일 가는 그곳',
  '#오래된가게': '시간이 쌓인 곳',
  '#골목': '큰길 말고 뒷길',
  '#공강벤치': '혼자 쉬는 자리',
  '#학교앞분식': '친구 데려가는 곳',
  '#노을': '해질녘 풍경',
  '#혼자만의자리': '조용히 머무는 곳',
};

/** 2/3 단계에서 최소로 골라야 하는 해시태그 수 (서버 기준, 마이 탭 기호 설정과 같다) */
export { minPreferredTagCount as minPlaceCount } from '@/constants/preferred-tags';

// 걷는 때·시간 보기는 마이 탭 기호 설정과 같이 쓰려고 src/constants로 옮겼다
export { walkDurationOptions, walkTimeOptions, type WalkDuration, type WalkTime } from '@/constants/walk-options';

export type SurveyAnswers = {
  relation?: RelationOption['id'];
  /** 서버 태그 id. 관계와 함께 서버에 저장한다 (걷는 때는 서버 보기가 정해지면 연결한다). */
  placeTagIds: number[];
  walkTimes: WalkTime[];
  walkDuration?: WalkDuration;
};
