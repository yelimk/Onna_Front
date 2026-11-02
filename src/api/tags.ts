import { apiRequest } from '@/api/client';
import type { Question, Tag } from '@/types/api';

/** 서버의 해시태그 사전. 설문·기호 설정·AI 추천은 모두 이 목록 안에서만 고른다. */
export function getTags() {
  return apiRequest<Tag[]>('/tags');
}

/** 남기기 질문 하나. 받은 id를 태그 추천과 업로드에 questionId로 같이 보낸다. */
export function getRandomQuestion() {
  return apiRequest<Question>('/questions/random');
}
