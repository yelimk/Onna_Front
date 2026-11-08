/**
 * 서버가 주고받는 데이터 모양. 스웨거(/v3/api-docs)의 DTO 이름과 필드를 그대로 옮겼다.
 * 위치는 lat·lng(도), accuracy(m). 날짜는 ISO 문자열. imageUrl은 30분 뒤 만료되니 오래 들고 있지 않는다.
 */

export type Coordinate = {
  lat: number;
  lng: number;
};

/** 내 위치. 정확도(m)가 50보다 나쁘면 서버가 RETRY_LOCATION으로 거절한다. */
export type MyLocation = Coordinate & {
  accuracy: number;
};

/** 신고 이유. 서버(POST /posts/{postId}/reports)가 받는 값 그대로다. 화면 문구는 features/map/constants/report-reasons.ts */
export type ReportReason = 'privacy' | 'private-space' | 'inappropriate' | 'advertising' | 'other';

/** S0(멀리) → S1 → S2 → OPEN(열림). 단계가 오를수록 더 선명한 사진이 온다. */
export type PostStage = 'S0' | 'S1' | 'S2' | 'OPEN';

/** 온보딩·기호 설정에서 고르는 서버 태그 사전. AI가 만든 해시태그는 사전에 없어서 이름(string)으로만 주고받는다. */
export type Tag = {
  id: number;
  name: string;
  category?: string;
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

export type PostPreview = Coordinate & {
  postId: number;
  /** 기록 제목 (10자) */
  title: string;
  stage: PostStage;
  imageUrl: string;
  tags: string[];
  /** 맛보기(흐리지 않게 보여주는 사진)인지 */
  isTeaser: boolean;
  /** 내가 좋아요했는지 */
  liked: boolean;
  /** 내 위치에서 사진까지 거리(10m 단위). 위치 없이 부르면 null. 사진 좌표(lat·lng)는 일부러 흐린 좌표다. */
  distanceM: number | null;
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
  /** 기록 제목 (10자) */
  title: string;
  oneLine: string;
  tags: string[];
  /** 이 기록이 남겨진 구역 이름·주소 ('영남대학교 정문', '경산시 대동') */
  zoneName: string;
  zoneAddress: string;
  liked: boolean;
};

export type CreatedPost = {
  postId: number;
  /** 다른 사람 지도에 보이기 시작하는 시각 (올린 뒤 24시간, 내 기록에는 바로 보인다) */
  publishAt: string;
};

export type MyPost = Coordinate & {
  postId: number;
  questionId: number;
  /** 기록 제목. 제목 필수가 되기 전에 올린 기록은 비어 있을 수 있다. */
  title?: string;
  oneLine: string;
  imageUrl: string;
  tags: string[];
  likeCount: number;
  createdAt: string;
};

/** 온보딩 1단계 '대구·경북과의 사이'. NATIVE(토박이에요), MOVED_IN(대구·경북으로 왔어요), VISITING(잠깐 머무는 중이에요) */
export type RegionRelation = 'NATIVE' | 'MOVED_IN' | 'VISITING';

/** 걷는 방식. COMMUTE(등하굣길), BREAK(공강 시간), EVENING(저녁 산책), RUNNING(러닝할 때), WEEKEND(주말 나들이) */
export type WalkStyle = 'COMMUTE' | 'BREAK' | 'EVENING' | 'RUNNING' | 'WEEKEND';

/** 한번에 걷는 시간(분). 30은 '30분 이상' */
export type WalkMinutes = 10 | 20 | 30;

/** 걷는 방식(1개 이상)과 한번에 걷는 시간. 고르기 전에 불러오면 styles는 [], minutes는 null */
export type WalkPreference = {
  styles: WalkStyle[];
  minutes: WalkMinutes | null;
};

export type Badge = {
  /** FIRST_DISCOVERER(최초 발견자), WALKER(걸음왕) */
  code: string;
  name: string;
  earned: boolean;
};

/** 마이 화면 숫자. 작성자가 지운 사진은 어느 숫자에도 들어가지 않는다. */
export type Achievements = {
  postedCount: number;
  openedCount: number;
  likedCount: number;
  badges: Badge[];
};

/** 연 자리 기록·좋아요 내역의 한 줄. imageUrl은 선명한(OPEN) 사진이다. */
type MySpotBase = {
  postId: number;
  title: string;
  imageUrl: string;
  tags: string[];
  zoneName: string | null;
  /** 한 줄 코멘트. 상세 화면에 필요해서 백엔드에 추가를 요청했다. 서버가 주기 전까지는 비어 있다. */
  oneLine?: string;
};

export type OpenedSpot = MySpotBase & { openedAt: string };

/**
 * 알림 한 줄. OPENED: 누군가 내 자리를 열었다 / TEASER: 내 사진이 구역 대표 사진이 되었다.
 * 안 읽음 표시는 서버가 주지 않아서, 앱이 알림 화면을 마지막으로 본 시각과 createdAt을 비교해 정한다.
 */
export type AppNotification = {
  type: 'OPENED' | 'TEASER';
  postId: number;
  title: string;
  zoneName: string | null;
  imageUrl: string;
  /** 열린 시각 / 대표 사진이 된 시각 */
  createdAt: string;
  /** 내가 남긴 한 줄. Figma 알림에 필요해서 백엔드에 추가를 요청했다. 서버가 주기 전까지는 비어 있다. */
  oneLine?: string;
};

export type LikedSpot = MySpotBase & { likedAt: string };

export type HashtagSearchResult = Coordinate & {
  tagId: number;
  name: string;
  distanceM: number;
  postCount: number;
  /** 기록 핀. 구역 밖에 남긴 기록은 zoneName이 null이다. */
  posts: (Coordinate & { postId: number; zoneName: string | null })[];
};

/** 경로에 들를 자리 */
export type RouteStop = Coordinate & {
  postId: number;
  title: string;
  /** 해시태그 이름 ('#' 없이) */
  tags: string[];
  zoneName: string | null;
};

export type RouteRecommendation = {
  /** 들를 곳이 없으면 null */
  title: string | null;
  stops: RouteStop[];
  /**
   * AI 서버가 이은 실제 보행 경로(길 좌표)와 걷는 거리(m).
   * 목적지 없이 불렀고 AI가 6초 안에 답했을 때만 오고, 목적지를 보냈거나 AI가 실패하면 null이다.
   */
  path: Coordinate[] | null;
  distanceM: number | null;
};
