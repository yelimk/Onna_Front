import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { getCachedMe, setCachedMe } from '@/api/me-cache';
import { getMe, getMyAchievements } from '@/api/users';
import { getProfileBadges } from '@/features/my/utils/get-profile-badges';
import { mockMyPosts } from '@/mock/my-posts';
import { mockLikedSpots, mockOpenedSpots } from '@/mock/my-spots';
import type { Achievements, Me } from '@/types/api';

/** 서버 숫자가 0이면 목록 화면처럼 예시 개수를 보여준다 (시연 전에 지운다, mock/my-posts.ts·my-spots.ts) */
const countOrSample = (count: number | undefined, sampleCount: number) => (count ? count : sampleCount);

/** 닉네임을 처음 받다 실패했을 때(인터넷이 잠깐 끊김, 출입증을 새로 받는 중 등) 다시 물어보기까지 기다리는 시간 */
const meRetryDelayMs = 1500;

/**
 * 마이 탭 첫 화면의 닉네임, 칭호, 숫자.
 * 칭호와 숫자는 기록을 남기거나 자리를 열고 돌아오면 바뀌어서 들어올 때마다 다시 받는다.
 * 닉네임은 바뀌지 않아서 한 번 받은 값을 기억해 두고 쓴다 (api/me-cache.ts). 그래야 들어올 때 비어 보이지 않는다.
 */
export function useMySummary() {
  const [me, setMe] = useState<Me | null>(getCachedMe);
  const [achievements, setAchievements] = useState<Achievements | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      let retryTimer: ReturnType<typeof setTimeout> | undefined;
      const loadMe = (canRetry: boolean) =>
        getMe()
          .then((loaded) => {
            setCachedMe(loaded);
            if (isActive) setMe(loaded);
          })
          .catch(() => {
            if (canRetry && isActive) retryTimer = setTimeout(() => loadMe(false), meRetryDelayMs);
          });

      if (!getCachedMe()) loadMe(true);
      getMyAchievements().then(setAchievements).catch(() => undefined);
      return () => {
        isActive = false;
        clearTimeout(retryTimer);
      };
    }, []),
  );

  return {
    nickname: me?.nickname ?? '',
    badges: getProfileBadges(achievements?.badges),
    leftCount: countOrSample(achievements?.postedCount, mockMyPosts.length),
    openedCount: countOrSample(achievements?.openedCount, mockOpenedSpots.length),
    likedCount: countOrSample(achievements?.likedCount, mockLikedSpots.length),
  };
}
