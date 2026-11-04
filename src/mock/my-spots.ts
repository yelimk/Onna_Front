/**
 * 서버 목록이 비었을 때 대신 보여주는 '좋아요 내역'·'연 자리 기록' 예시 (Figma GUI 마이 탭 예시 그대로). 시연 전에 지운다.
 * 새 계정은 남의 사진을 열거나 좋아요한 적이 없어서 목록이 비어 있다. 화면을 눈으로 확인하려고 둔다.
 * 지울 때는 이 파일과 features/my/hooks/use-my-spots.ts, use-liked-spots.ts의 예시 부분을 같이 지운다.
 */

import { Image } from 'react-native';

import { samplePhotos } from '@/mock/sample-photos';
import type { LikedSpot, OpenedSpot } from '@/types/api';

// 서버 사진은 주소(문자열)라서, 앱 안 예시 사진도 주소로 바꿔 같은 모양으로 맞춘다
const toUri = (photo: number) => Image.resolveAssetSource(photo)?.uri ?? '';

// 서버 기록 번호와 겹치지 않게 큰 번호를 쓴다
const sampleSpotIds = [900001, 900002, 900003];

/** 예시 자리인지. 예시 자리의 좋아요는 서버에 보내지 않고 화면에서만 바꾼다 */
export function isSampleSpot(postId: number) {
  return sampleSpotIds.includes(postId);
}

const sampleSpots = [
  {
    postId: sampleSpotIds[0],
    title: '오페라하우스',
    imageUrl: toUri(samplePhotos.operaHouse),
    tags: ['말없이챙겨준', '국밥집', '단골'],
    zoneName: '정문',
  },
  {
    postId: sampleSpotIds[1],
    title: '아침 창문',
    imageUrl: toUri(samplePhotos.morningWindow),
    tags: ['창밖풍경', '아침'],
    zoneName: '기숙사',
  },
  {
    postId: sampleSpotIds[2],
    title: '비둘기',
    imageUrl: toUri(samplePhotos.pigeon),
    tags: ['동물친구', '퉁퉁'],
    zoneName: null,
  },
];

export const mockLikedSpots: LikedSpot[] = sampleSpots.map((spot, index) => ({
  ...spot,
  likedAt: `2026-10-2${8 - index}T12:00:00+09:00`,
}));

// 날짜별 묶음이 보이게 앞의 두 개는 같은 날, 마지막은 전날로 둔다
export const mockOpenedSpots: OpenedSpot[] = sampleSpots.map((spot, index) => ({
  ...spot,
  openedAt: index < 2 ? '2026-10-28T12:00:00+09:00' : '2026-10-27T12:00:00+09:00',
}));
