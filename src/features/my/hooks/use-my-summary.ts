import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { getMe, getMyAchievements } from '@/api/users';
import { mockMyPosts } from '@/mock/my-posts';
import { mockLikedSpots, mockOpenedSpots } from '@/mock/my-spots';
import type { Achievements, Me } from '@/types/api';

/** 서버 숫자가 0이면 목록 화면처럼 예시 개수를 보여준다 (시연 전에 지운다, mock/my-posts.ts·my-spots.ts) */
const countOrSample = (count: number | undefined, sampleCount: number) => (count ? count : sampleCount);

/**
 * 마이 탭 첫 화면의 닉네임과 숫자. 기록을 남기거나 자리를 열고 돌아오면 숫자가 바뀌어서 들어올 때마다 다시 받는다.
 */
export function useMySummary() {
  const [me, setMe] = useState<Me | null>(null);
  const [achievements, setAchievements] = useState<Achievements | null>(null);

  useFocusEffect(
    useCallback(() => {
      getMe().then(setMe).catch(() => undefined);
      getMyAchievements().then(setAchievements).catch(() => undefined);
    }, []),
  );

  return {
    nickname: me?.nickname ?? '',
    leftCount: countOrSample(achievements?.postedCount, mockMyPosts.length),
    openedCount: countOrSample(achievements?.openedCount, mockOpenedSpots.length),
    likedCount: countOrSample(achievements?.likedCount, mockLikedSpots.length),
  };
}
