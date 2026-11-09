import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { getMyPosts } from '@/api/users';
import type { MyPost } from '@/types/api';

/**
 * 내가 남긴 기록. 기록 탭과 마이 탭(남긴 자리 수)이 같이 써서 src/hooks에 둔다.
 * 사진 주소가 30분 뒤 만료되고 새로 남긴 기록도 바로 보여야 해서, 화면에 들어올 때마다 다시 받는다.
 * posts가 null이면 아직 불러오는 중이다.
 */
export function useMyPosts() {
  const [posts, setPosts] = useState<MyPost[] | null>(null);
  const [hasFailed, setHasFailed] = useState(false);

  const fetchPosts = useCallback(
    () =>
      getMyPosts()
        .then((result) => {
          setPosts(result);
          setHasFailed(false);
        })
        .catch(() => setHasFailed(true)),
    [],
  );

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [fetchPosts]),
  );

  return { posts, hasFailed, reload: fetchPosts };
}
