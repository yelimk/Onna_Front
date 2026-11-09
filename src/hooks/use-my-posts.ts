import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { getCached, setCached } from '@/api/response-cache';
import { getMyPosts } from '@/api/users';
import type { MyPost } from '@/types/api';

/**
 * 내가 남긴 기록. 기록 탭과 기록 상세가 같이 써서 src/hooks에 둔다.
 * 사진 주소가 30분 뒤 만료되고 새로 남긴 기록도 보여야 해서 화면에 들어올 때마다 다시 받는다.
 * 받는 동안 비어 보이지 않게 지난번 목록을 먼저 보여 준다 (api/response-cache.ts). 그래서 목록에서 상세를 열면 바로 보인다.
 * posts가 null이면 처음 불러오는 중이다.
 */
export function useMyPosts() {
  const [posts, setPosts] = useState<MyPost[] | null>(() => getCached('myPosts') ?? null);
  const [hasFailed, setHasFailed] = useState(false);

  const fetchPosts = useCallback(
    () =>
      getMyPosts()
        .then((result) => {
          setCached('myPosts', result);
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

/** 지운 기록은 기억해 둔 목록에서도 바로 뺀다. 목록으로 돌아갔을 때 지운 기록이 잠깐 다시 보이지 않게 한다 */
export function forgetMyPost(postId: number) {
  const posts = getCached('myPosts');
  if (posts) setCached('myPosts', posts.filter((post) => post.postId !== postId));
}
