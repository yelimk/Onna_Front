import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { getMe, getMyAchievements } from '@/api/users';
import { useMyPosts } from '@/hooks/use-my-posts';
import type { Achievements, Me } from '@/types/api';

/**
 * 마이 탭 첫 화면의 닉네임과 숫자. 기록을 남기거나 자리를 열고 돌아오면 숫자가 바뀌어서 들어올 때마다 다시 받는다.
 * 남긴 자리 수는 따로 주는 API가 없어서 내 기록 목록의 개수로 센다.
 */
export function useMySummary() {
  const [me, setMe] = useState<Me | null>(null);
  const [achievements, setAchievements] = useState<Achievements | null>(null);
  const { posts } = useMyPosts();

  useFocusEffect(
    useCallback(() => {
      getMe().then(setMe).catch(() => undefined);
      getMyAchievements().then(setAchievements).catch(() => undefined);
    }, []),
  );

  return {
    nickname: me?.nickname ?? '',
    leftCount: posts?.length ?? 0,
    openedCount: achievements?.openedCount ?? 0,
  };
}
