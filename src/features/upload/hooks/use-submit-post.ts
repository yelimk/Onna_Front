import { router } from 'expo-router';
import { useState } from 'react';

import { isApiError } from '@/api/api-error';
import { createPost } from '@/api/posts';
import { showToast } from '@/components/toast';
import { useUploadDraft } from '@/features/upload/upload-draft';
import { getPhotoLocation } from '@/features/upload/utils/get-photo-location';
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
    } else {
      showToast('위치를 찾지 못했어요. 위치 권한을 확인해 주세요', 'error');
    }
  };

  const submit = async () => {
    // 올리는 동안 버튼 모양은 그대로 두고(Figma에 기다리는 모양이 없음), 두 번 눌러도 한 번만 보낸다
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
        showToast('얼굴이 보여요. 얼굴이 나오지 않게 다시 찍어 주세요', 'error');
      } else if (isApiError(error, 'RETRY_LOCATION')) {
        showToast('위치가 정확하지 않아요. 오른쪽 위 버튼으로 다시 찾아 주세요', 'error');
      } else {
        showApiError(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return { canSubmit, isLocating, relocate, submit };
}
