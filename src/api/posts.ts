import { apiRequest } from '@/api/client';
import type { CreatedPost, MyLocation, Tag } from '@/types/api';

/** 한 줄 코멘트를 보내고 AI가 고른 해시태그 후보를 받는다 */
export async function getTagSuggestions(questionId: number, oneLine: string) {
  const { tags } = await apiRequest<{ tags: Tag[] }>('/posts/tag-suggestions', {
    method: 'POST',
    body: { questionId, oneLine },
  });
  return tags;
}

type CreatePostInput = {
  /** 앱이 찍어서 3:4, 1080×1440으로 맞춘 사진 파일 주소 (utils/normalize-photo.ts) */
  photoUri: string;
  /** 찍은 순간의 위치. 사진 EXIF가 아니라 이 값으로 위치를 정한다 (PRD SAFE-07) */
  location: MyLocation;
  questionId: number;
  oneLine: string;
  /** 최대 3개 */
  tagIds: number[];
};

/**
 * 사진 남기기. 얼굴이 보이면 FACE_DETECTED(422), 위치가 부정확하면 RETRY_LOCATION.
 * 사진 파일 때문에 JSON이 아니라 multipart로 보낸다.
 */
export function createPost({ photoUri, location, questionId, oneLine, tagIds }: CreatePostInput) {
  const formData = new FormData();
  // React Native의 FormData는 파일을 {uri, name, type} 모양으로 받는다
  formData.append('image', { uri: photoUri, name: 'photo.jpg', type: 'image/jpeg' } as unknown as Blob);
  formData.append('lat', String(location.lat));
  formData.append('lng', String(location.lng));
  formData.append('accuracy', String(location.accuracy));
  formData.append('questionId', String(questionId));
  formData.append('oneLine', oneLine);
  // 서버(Spring)는 같은 이름을 여러 번 보내면 배열로 받는다
  tagIds.forEach((tagId) => formData.append('tagIds', String(tagId)));

  return apiRequest<CreatedPost>('/posts', { method: 'POST', formData });
}

/** 내 기록 삭제. 남의 기록이면 NOT_OWNER, 없으면 POST_NOT_FOUND */
export function deletePost(postId: number) {
  return apiRequest<void>(`/posts/${postId}`, { method: 'DELETE' });
}
