/**
 * 서버 알림이 비었을 때 대신 보여주는 '알림' 예시 (Figma GUI ③ 알림 예시 그대로). 시연 전에 지운다.
 * 새 계정은 남이 내 자리를 연 적이 없어서 알림이 비어 있다. 화면과 빨간 점 동작을 눈으로 확인하려고 둔다.
 * 알림을 누르면 기록 상세로 가야 해서, 알림마다 같은 내용의 예시 기록도 같이 둔다 (mockNotificationPosts).
 * 지울 때는 이 파일과 features/notification/hooks/use-notifications.ts, record-detail-screen.tsx의 예시 부분을 같이 지운다.
 */

import { Image } from 'react-native';

import { samplePhotos } from '@/mock/sample-photos';
import type { AppNotification, MyPost } from '@/types/api';
import { getStartOfToday, getStartOfWeek } from '@/utils/week-range';

const toUri = (photo: number) => Image.resolveAssetSource?.(photo)?.uri ?? '';

/*
 * 예시가 '몇 시간 전', '며칠 전'처럼 여러 묶음으로 보이게 오늘 0시와 이번 주 월요일 0시를 기준으로 시각을 정한다.
 * 지금 시각 기준으로 정하면 앱을 켤 때마다 알림이 새로 온 것처럼 빨간 점이 다시 붙는다.
 */
const minutesAfterToday = (minutes: number) => new Date(getStartOfToday() + minutes * 60_000).toISOString();
const minutesAfterMonday = (minutes: number) => new Date(getStartOfWeek() + minutes * 60_000).toISOString();
const daysBeforeToday = (days: number) => new Date(getStartOfToday() - days * 86_400_000).toISOString();

const samples = [
  // Figma 알림 예시 문구. 첫 줄은 한 줄을 넘겨 '…'로 잘리는 모양을 보여주려고 길게 둔다. 셋째 줄은 Figma가 'Text'로 비어 있어서 앱에서 채웠다.
  { postId: -11, type: 'OPENED', title: '오페라하우스', oneLine: '오페라하우스의 지붕이 노랗게 물들었다, 해가 질 때까지 아무도 자리를 뜨지 않았다', photo: samplePhotos.operaHouse, createdAt: minutesAfterToday(2) },
  { postId: -12, type: 'TEASER', title: '아침 창문', oneLine: '아침마다 창문 열어주시는 경비 아저씨', photo: samplePhotos.morningWindow, createdAt: minutesAfterToday(1) },
  { postId: -13, type: 'OPENED', title: '경비실 앞', oneLine: '비 오는 날 경비 아저씨가 우산을 빌려주셨다', photo: samplePhotos.operaHouse, createdAt: minutesAfterMonday(0) },
] as const;

export const mockNotifications: AppNotification[] = samples.map((sample) => ({
  type: sample.type,
  postId: sample.postId,
  title: sample.title,
  zoneName: '정문',
  imageUrl: toUri(sample.photo),
  createdAt: sample.createdAt,
  oneLine: sample.oneLine,
}));

/** 예시 알림을 누르면 열리는 기록 상세의 내용 */
export const mockNotificationPosts: MyPost[] = samples.map((sample) => ({
  postId: sample.postId,
  questionId: 6,
  title: sample.title,
  oneLine: sample.oneLine,
  imageUrl: toUri(sample.photo),
  lat: 35.8326,
  lng: 128.754,
  tags: ['말없이챙겨준', '단골'],
  likeCount: 3,
  createdAt: daysBeforeToday(7),
}));
