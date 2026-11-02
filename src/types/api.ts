/**
 * 서버가 주고받는 데이터 모양. 스웨거(/v3/api-docs)의 DTO 이름과 필드를 그대로 옮겼다.
 * 위치는 lat·lng(도), accuracy(m). 날짜는 ISO 문자열. imageUrl은 5분 뒤 만료되니 오래 들고 있지 않는다.
 */

export type Coordinate = {
  lat: number;
  lng: number;
};

/** 내 위치. 정확도(m)가 50보다 나쁘면 서버가 RETRY_LOCATION으로 거절한다. */
export type MyLocation = Coordinate & {
  accuracy: number;
};

/** S0(멀리) → S1 → S2 → OPEN(열림). 단계가 오를수록 더 선명한 사진이 온다. */
export type PostStage = 'S0' | 'S1' | 'S2' | 'OPEN';

export type Tag = {
  id: number;
  name: string;
};

export type Me = {
  userId: number;
  email: string;
  nickname: string;
  /** false면 취향 설문을 아직 안 한 사용자 */
  onboarded: boolean;
};

export type Question = {
  id: number;
  text: string;
};

export type PostPreview = {
  postId: number;
  stage: PostStage;
  imageUrl: string;
  tags: string[];
  /** 맛보기(흐리지 않게 보여주는 사진)인지 */
  isTeaser: boolean;
  distanceM: number;
};

export type Zone = Coordinate & {
  zoneId: number;
  name: string;
  isLandmark: boolean;
  postCount: number;
  /** 일반 구역 1장, 랜드마크 최대 2장. 사진이 없는 구역은 빈 배열 */
  previews: PostPreview[];
  topTags: string[];
  moreTagCount: number;
};

export type OpenedPost = {
  postId: number;
  imageUrl: string;
  question: string;
  oneLine: string;
  tags: string[];
  liked: boolean;
};

export type CreatedPost = {
  postId: number;
  /** 다른 사람 지도에 보이기 시작하는 시각 (보통 2시간 뒤) */
  publishAt: string;
};

export type MyPost = Coordinate & {
  postId: number;
  questionId: number;
  oneLine: string;
  imageUrl: string;
  tags: string[];
  likeCount: number;
  createdAt: string;
};

export type Achievements = {
  openedCount: number;
  discoveredZoneCount: number;
  firstOpenCount: number;
};

export type HashtagSearchResult = Coordinate & {
  tagId: number;
  name: string;
  distanceM: number;
  postCount: number;
  posts: (Coordinate & { postId: number })[];
};

export type RouteRecommendation = {
  title: string;
  stops: (Coordinate & { postId: number })[];
};
