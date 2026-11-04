import { useCallback, useEffect, useState } from 'react';

import { getTags } from '@/api/tags';
import type { Tag } from '@/types/api';

/**
 * 서버의 해시태그 사전을 불러온다. 취향 설문과 사용자 기호 설정이 같이 써서 src/hooks에 둔다.
 * tags가 null이면 아직 불러오는 중이다.
 * 못 불러오면 화면이 비어서 고를 수 없으니, 사라지는 토스트 대신 화면에 남는 '다시 불러오기' 글자를 쓰게 hasFailed를 준다 (기록 탭과 같은 방식).
 */
export function useTags() {
  const [tags, setTags] = useState<Tag[] | null>(null);
  const [hasFailed, setHasFailed] = useState(false);

  // 상태는 응답이 온 뒤에만 바꾼다 (화면이 그려지는 도중에 바로 바꾸면 한 번 더 그리게 된다)
  const fetchTags = useCallback(
    () =>
      getTags()
        .then(setTags)
        .catch(() => setHasFailed(true)),
    [],
  );

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const reload = () => {
    setHasFailed(false);
    fetchTags();
  };

  return { tags, hasFailed, reload };
}
