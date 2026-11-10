import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { getCached, setCached } from '@/api/response-cache';
import { getMe, getMyAchievements } from '@/api/users';
import { getProfileBadges } from '@/features/my/utils/get-profile-badges';
import type { Achievements, Me } from '@/types/api';

/** 닉네임을 처음 받다 실패했을 때(인터넷이 잠깐 끊김, 출입증을 새로 받는 중 등) 다시 물어보기까지 기다리는 시간 */
const meRetryDelayMs = 1500;

/**
 * 마이 탭 첫 화면의 닉네임, 칭호, 숫자.
 * 들어올 때 비어 보이지 않게 지난번 값을 먼저 보여 준다 (api/response-cache.ts).
 * 칭호와 숫자는 기록을 남기거나 자리를 열고 돌아오면 바뀌어서, 들어올 때마다 다시 받아 바뀐 숫자만 바꾼다.
 * 닉네임은 바뀌지 않아서 한 번 받으면 다시 묻지 않는다.
 */
export function useMySummary() {
  const [me, setMe] = useState<Me | null>(() => getCached('me') ?? null);
  const [achievements, setAchievements] = useState<Achievements | null>(() => getCached('myAchievements') ?? null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      let retryTimer: ReturnType<typeof setTimeout> | undefined;
      const loadMe = (canRetry: boolean) =>
        getMe()
          .then((loaded) => {
            setCached('me', loaded);
            if (isActive) setMe(loaded);
          })
          .catch(() => {
            if (canRetry && isActive) retryTimer = setTimeout(() => loadMe(false), meRetryDelayMs);
          });

      if (!getCached('me')) loadMe(true);
      getMyAchievements()
        .then((loaded) => {
          setCached('myAchievements', loaded);
          if (isActive) setAchievements(loaded);
        })
        .catch(() => undefined);
      return () => {
        isActive = false;
        clearTimeout(retryTimer);
      };
    }, []),
  );

  return {
    nickname: me?.nickname ?? '',
    badges: getProfileBadges(achievements?.badges),
    leftCount: achievements?.postedCount ?? 0,
    openedCount: achievements?.openedCount ?? 0,
    likedCount: achievements?.likedCount ?? 0,
  };
}
