/** 온보딩 설문 선택지. GUI 설문 1/3~3/3 문구 그대로. 첫 추천의 근거가 된다. */

export type RelationOption = {
  id: 'local' | 'moved' | 'visiting';
  title: string;
  description: string;
};

export const relationOptions: RelationOption[] = [
  { id: 'local', title: '토박이에요', description: '대구·경북 토박이에요. 익숙한 곳을 새로 보고 싶어요' },
  { id: 'moved', title: '대구·경북으로 왔어요', description: '학교나 일 때문에 와서 지내고 있어요' },
  { id: 'visiting', title: '잠깐 머무는 중이에요', description: '여행이나 짧은 일정으로 왔어요' },
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

/** 2/3 단계에서 최소로 골라야 하는 해시태그 수 */
export const minPlaceCount = 3;

export const walkTimeOptions = ['등하굣길', '공강 시간', '저녁 산책', '러닝할 때', '주말 나들이'] as const;
export type WalkTime = (typeof walkTimeOptions)[number];

export const walkDurationOptions = ['10분', '20분', '30분 이상'] as const;
export type WalkDuration = (typeof walkDurationOptions)[number];

export type SurveyAnswers = {
  relation?: RelationOption['id'];
  /** 서버 태그 id. 서버에는 이것만 저장한다 (관계·걷는 때는 아직 저장할 API가 없다). */
  placeTagIds: number[];
  walkTimes: WalkTime[];
  walkDuration?: WalkDuration;
};
