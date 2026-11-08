import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { getMyPosts } from '@/api/users';
import type { PhotoMarker } from '@/features/map/types/home-map-marker';
import { rememberRecords } from '@/features/map/utils/known-records';
import { fromServerCoordinate } from '@/features/map/utils/to-coordinate';
import { toHashtags } from '@/features/map/utils/to-hashtags';
import type { MyPost } from '@/types/api';

/** 내 기록 → 지도 사진 마커. 내 사진은 거리와 상관없이 열리므로(서버 열기 규칙) 열린 모습으로 놓는다. */
function toMyPostMarker(post: MyPost): PhotoMarker {
  return {
    kind: 'photo',
    id: String(post.postId),
    coordinate: fromServerCoordinate(post),
    hashtags: toHashtags(post.tags),
    isOpen: true,
    imageUrl: post.imageUrl,
    title: post.title,
    comment: post.oneLine,
    isMine: true,
  };
}

/**
 * 지도 홈에 올릴 내 기록(GET /users/me/posts).
 * 지도 구역(GET /map/zones)은 내 사진을 빼고 주고, 남의 지도에는 24시간 뒤에야 보인다.
 * 그래도 내가 남긴 자리는 바로 지도에 보여야 해서, 내 기록을 따로 받아 마커로 더한다.
 * 방금 남긴 기록도 보이도록 지도 홈에 들어올 때마다 다시 받는다 (사진 주소 30분 만료도 같이 해결된다).
 * 기록 탭의 useMyPosts는 비어 있으면 예시 기록을 보여줘서, 지도에 가짜 자리가 찍히지 않게 따로 부른다.
 */
export function useMyMapPosts() {
  const [posts, setPosts] = useState<MyPost[]>([]);

  useFocusEffect(
    useCallback(() => {
      let isStale = false;
      getMyPosts()
        .then((result) => {
          if (!isStale) setPosts(result);
        })
        // 내 기록을 못 받아도 남의 기록 지도는 그대로 보여야 해서, 받아 둔 것을 그대로 둔다.
        .catch(() => {});
      return () => {
        isStale = true;
      };
    }, []),
  );

  const markers = useMemo(() => posts.map(toMyPostMarker), [posts]);

  // 내 사진 마커를 눌러 연 사진 카드가 이 기록을 찾을 수 있게 기억해 둔다.
  useEffect(() => rememberRecords(markers), [markers]);

  return markers;
}
