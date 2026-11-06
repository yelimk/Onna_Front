import { router } from 'expo-router';
import { useState } from 'react';

import { isApiError } from '@/api/api-error';
import { createPost } from '@/api/posts';
import { showToast } from '@/components/toast';
import { useUploadDraft } from '@/features/upload/upload-draft';
import { getPhotoLocation, hasLocationPermission } from '@/features/upload/utils/get-photo-location';
import { showApiError } from '@/utils/show-api-error';

/**
 * 위치 확인 화면의 '기록 완료'와 '위치 다시 찾기'.
 * 서버가 거절하는 두 경우(얼굴, 부정확한 위치)는 사용자가 할 일이 달라서 따로 안내한다.
 * Figma에 이 안내 화면이 없어서, 다른 오류처럼 빨간 토스트로 알린다 (팀 결정). 2초 안에 읽히게 짧게 쓴다.
 */
export function useSubmitPost() {
  const { draft, updateDraft } = useUploadDraft();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const canSubmit =
    !!draft.photoUri && !!draft.location && draft.questionId !== undefined && !isLocating;

  const relocate = async () => {
    setIsLocating(true);
    const location = await getPhotoLocation();
    setIsLocating(false);
    if (location) {
      updateDraft({ location });
      return;
    }
    // 권한이 꺼져 있으면 기다려도 소용없어서 권한을 켜라고 하고, 권한이 있으면 신호를 못 잡은 거라 잠시 뒤 다시 누르게 한다
    const message = (await hasLocationPermission())
      ? '위치를 찾지 못했어요. 잠시 후 다시 눌러 주세요'
      : '위치 권한을 켜 주세요';
    showToast(message, 'error');
  };

  const submit = async () => {
    // 올리는 동안 버튼에 도는 동그라미를 보여주고(Figma 사진 올릴 때 로딩), 두 번 눌러도 한 번만 보낸다
    if (isSubmitting) return;
    if (!draft.photoUri || !draft.location || draft.questionId === undefined) return;
    setIsSubmitting(true);
    try {
      await createPost({
        photoUri: draft.photoUri,
        location: draft.location,
        questionId: draft.questionId,
        title: draft.title.trim(),
        oneLine: draft.oneLine.trim(),
        tags: draft.hashtags,
      });
      router.dismissTo('/record');
    } catch (error) {
      if (isApiError(error, 'FACE_DETECTED')) {
        showToast('얼굴이 포함되어 있어요. 다시 찍어 주세요', 'error');
        // 다시 찍을 버튼이 이 화면에 없어서 촬영 화면으로 바로 돌려보낸다.
        // 처음부터 다시 올리는 것과 같게 질문·제목·한 줄·해시태그를 모두 비운다 (팀 결정). 질문이 비면 한 줄 남기기에서 새로 받는다.
        updateDraft({ questionId: undefined, question: undefined, title: '', oneLine: '', hashtags: [] });
        router.dismissTo('/upload/camera');
      } else if (isApiError(error, 'RETRY_LOCATION')) {
        showToast('위치가 정확하지 않아요. 오른쪽 위 버튼으로 다시 찾아 주세요', 'error');
      } else {
        showApiError(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return { canSubmit, isLocating, isSubmitting, relocate, submit };
}
