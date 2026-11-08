import { File } from 'expo-file-system';

import { apiRequest } from '@/api/client';
import type { CreatedPost, MyLocation, ReportReason } from '@/types/api';

/**
 * 한 줄을 보내고 AI가 새로 만든 해시태그 이름 3~5개(# 없음)를 받는다.
 * AI 해시태그는 태그 사전에 없어서 번호 없이 이름으로만 온다. AI 응답을 최대 6초까지 기다려서 늦게 올 수 있다.
 */
export async function getTagSuggestions(oneLine: string) {
  const { tags } = await apiRequest<{ tags: string[] }>('/posts/tag-suggestions', {
    method: 'POST',
    body: { oneLine },
  });
  return tags;
}

type CreatePostInput = {
  /** 앱이 찍어서 3:4, 1080×1440으로 맞춘 사진 파일 주소 (utils/normalize-photo.ts) */
  photoUri: string;
  /** 찍은 순간의 위치. 사진 EXIF가 아니라 이 값으로 위치를 정한다 (PRD SAFE-07) */
  location: MyLocation;
  questionId: number;
  /** 10자까지 */
  title: string;
  /** 40자까지 */
  oneLine: string;
  /** 고른 해시태그 이름, 최대 3개 */
  tags: string[];
};

/**
 * 사진 남기기. 얼굴이 보이면 FACE_DETECTED(422), 위치가 부정확하면 RETRY_LOCATION.
 * 사진 파일 때문에 JSON이 아니라 multipart로 보낸다.
 */
export function createPost({ photoUri, location, questionId, title, oneLine, tags }: CreatePostInput) {
  const formData = new FormData();
  // 앱의 fetch(expo/fetch)는 옛 React Native 방식 {uri, name, type}을 받지 못하고 'Unsupported FormDataPart'로 끊긴다.
  // 그래서 expo-file-system의 File(Blob처럼 쓰는 파일)로 사진을 담는다.
  formData.append('image', new File(photoUri));
  formData.append('lat', String(location.lat));
  formData.append('lng', String(location.lng));
  formData.append('accuracy', String(location.accuracy));
  formData.append('questionId', String(questionId));
  formData.append('title', title);
  formData.append('oneLine', oneLine);
  // 서버(Spring)는 같은 이름을 여러 번 보내면 배열로 받는다
  tags.forEach((tag) => formData.append('tags', tag));

  return apiRequest<CreatedPost>('/posts', { method: 'POST', formData });
}

/**
 * 사진 신고. 지도 사진 카드와 마이 탭 상세가 같은 신고 창에서 부른다.
 * 같은 사진을 다시 신고해도 성공(처음 이유가 남는다)이라, 앱이 이미 신고했는지 따로 기억하지 않아도 된다.
 * 내 사진이면 INVALID_INPUT(400), 없거나 지웠거나 숨겨진 사진이면 POST_NOT_FOUND(404).
 */
export function reportPost(postId: number, reason: ReportReason) {
  return apiRequest<void>(`/posts/${postId}/reports`, { method: 'POST', body: { reason } });
}

/** 내 기록 삭제. 남의 기록이면 NOT_OWNER, 없으면 POST_NOT_FOUND */
export function deletePost(postId: number) {
  return apiRequest<void>(`/posts/${postId}`, { method: 'DELETE' });
}
