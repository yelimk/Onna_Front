/**
 * 서버 기록이 없을 때 대신 보여주는 '내 기록' 예시 (Figma GUI 기록 탭 예시 그대로). 시연 전에 지운다.
 * 사진 올리기가 서버에서 아직 안 돼서 새 계정은 내 기록이 비어 있다. 화면을 눈으로 확인하려고 둔다.
 * 서버에서 기록이 올라가는 것을 확인하면 이 파일과 hooks/use-my-posts.ts의 예시 대체 부분을 지운다.
 */

import { Image } from 'react-native';

import { samplePhotos } from '@/mock/sample-photos';
import type { MyPost } from '@/types/api';

// 서버 기록은 사진 주소(문자열)라서, 앱 안 예시 사진도 주소로 바꿔 같은 모양으로 맞춘다
const toUri = (photo: number) => Image.resolveAssetSource(photo)?.uri ?? '';

export const mockMyPosts: MyPost[] = [
  {
    postId: -1,
    questionId: 1,
    title: '하버브릿지',
    oneLine: '사람들의 행복한 표정을 보며 한참을 앉아 있었다, 노을이 질 때까지 아무도 일어나지 않았다',
    imageUrl: toUri(samplePhotos.harbourBridge),
    lat: 35.8326,
    lng: 128.754,
    tags: ['연인', '포옹', '온정'],
    likeCount: 6,
    createdAt: '2026-08-28T12:00:00+09:00',
  },
  {
    postId: -2,
    questionId: 1,
    title: '오페라하우스',
    oneLine: '노을 질 때 다 같이 사진 찍어주던 사람들',
    imageUrl: toUri(samplePhotos.operaHouse),
    lat: 35.8326,
    lng: 128.754,
    tags: ['말없이챙겨준', '노을'],
    likeCount: 4,
    createdAt: '2026-08-22T12:00:00+09:00',
  },
  {
    postId: -3,
    questionId: 1,
    title: '아침 창문',
    oneLine: '아름다운 풍경',
    imageUrl: toUri(samplePhotos.morningWindow),
    lat: 35.8326,
    lng: 128.754,
    tags: ['창밖풍경', '아침'],
    likeCount: 2,
    createdAt: '2026-08-13T12:00:00+09:00',
  },
  {
    postId: -4,
    questionId: 1,
    title: '비둘기',
    oneLine: '뚱뚱한 비둘기 앉아서 쉬는중',
    imageUrl: toUri(samplePhotos.pigeon),
    lat: 35.8326,
    lng: 128.754,
    tags: ['동물친구', '퉁퉁'],
    likeCount: 6,
    createdAt: '2026-08-02T12:00:00+09:00',
  },
];
