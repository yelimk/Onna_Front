import { useCallback, useEffect, useState } from 'react';

import { getRandomQuestion } from '@/api/tags';
import { useUploadDraft } from '@/features/upload/upload-draft';

/**
 * 한 줄 남기기 화면 위쪽 질문을 서버에서 하나 받아 draft에 넣는다.
 * 질문 id를 태그 추천과 업로드에 같이 보내야 해서 앱이 고르지 않고 서버가 준 질문을 쓴다.
 * 위치 확인 화면에 갔다가 돌아와도 질문이 바뀌지 않게, draft에 이미 있으면 다시 받지 않는다.
 */
export function useWriteQuestion() {
  const { draft, updateDraft } = useUploadDraft();
  const [hasFailed, setHasFailed] = useState(false);
  const hasQuestion = draft.questionId !== undefined;

  const fetchQuestion = useCallback(
    () =>
      getRandomQuestion()
        .then((question) => updateDraft({ questionId: question.id, question: question.text }))
        .catch(() => setHasFailed(true)),
    [updateDraft],
  );

  useEffect(() => {
    if (!hasQuestion) fetchQuestion();
  }, [hasQuestion, fetchQuestion]);

  const reload = () => {
    setHasFailed(false);
    fetchQuestion();
  };

  return { question: draft.question, questionId: draft.questionId, hasFailed, reload };
}
