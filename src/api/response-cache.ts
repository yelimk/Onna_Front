import type {
  Achievements,
  AppNotification,
  LikedSpot,
  Me,
  MyPost,
  OpenedSpot,
  Tag,
  WalkPreference,
} from '@/types/api';

/** 기억해 두는 서버 답. 이름마다 어떤 모양의 답인지 정해 둬서 꺼낼 때 타입이 맞는다 */
type CachedResponses = {
  me: Me;
  tags: Tag[];
  myTags: Tag[];
  myWalk: WalkPreference;
  myPosts: MyPost[];
  myAchievements: Achievements;
  myOpens: OpenedSpot[];
  myLikes: LikedSpot[];
  myNotifications: AppNotification[];
};

type CacheKey = keyof CachedResponses;

/*
 * 한 번 받은 서버 답을 기억해 두는 곳.
 * 화면에 들어올 때마다 서버에서 새로 받으면, 답이 올 때까지 화면이 잠깐 비어 보인다.
 * 그래서 들어오면 기억해 둔 답을 먼저 보여 주고, 같은 때 서버에 다시 물어 달라진 부분만 바꾼다.
 * 앱이 켜져 있는 동안만 기억한다. 사진 주소는 30분 뒤 만료되지만, 바로 새로 받은 주소로 바뀌어서 괜찮다.
 */
const cache = new Map<CacheKey, unknown>();

export function getCached<K extends CacheKey>(key: K) {
  return cache.get(key) as CachedResponses[K] | undefined;
}

export function setCached<K extends CacheKey>(key: K, value: CachedResponses[K]) {
  cache.set(key, value);
}

/** 다른 계정의 정보가 다음 계정에 보이면 안 되므로, 출입증을 지울 때(로그아웃, 탈퇴, 로그인 풀림) 모두 지운다 (token-storage.ts) */
export function clearCachedResponses() {
  cache.clear();
}
