import { useEffect, useState } from 'react';

import { getCached, setCached } from '@/api/response-cache';
import { getMyTags, getMyWalk, saveMyTags, saveMyWalk } from '@/api/users';
import type { WalkDuration, WalkTime } from '@/constants/walk-options';
import type { Tag } from '@/types/api';
import { showApiError } from '@/utils/show-api-error';
import { fromWalkPreference, toWalkPreference } from '@/utils/walk-preference';

/**
 * 사용자 기호 설정에서 고르는 값(해시태그, 걷는 방식, 한번에 걷는 시간)과 저장.
 * 전에 고른 값을 서버에서 받아 미리 골라 둔다. 들어올 때 비어 보이지 않게 지난번 값을 먼저 쓴다 (api/response-cache.ts).
 * 이 값은 이 화면(과 처음 설문)에서만 바뀌어서, 기억해 둔 값이 있으면 그대로 믿는다.
 * 서버 답으로 덮어쓰지 않는 건, 그사이 사용자가 누른 칩이 되돌아가지 않게 하려는 것이다.
 */
export function useSavedPreferences() {
  const cachedTags = getCached('myTags');
  const cachedWalk = getCached('myWalk');
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(() => cachedTags?.map((tag) => tag.id) ?? []);
  const [walkTimes, setWalkTimes] = useState<WalkTime[]>(() => (cachedWalk ? fromWalkPreference(cachedWalk).walkTimes : []));
  const [walkDuration, setWalkDuration] = useState<WalkDuration | undefined>(() =>
    cachedWalk ? fromWalkPreference(cachedWalk).walkDuration : undefined,
  );

  useEffect(() => {
    const hasCachedTags = getCached('myTags') !== undefined;
    const hasCachedWalk = getCached('myWalk') !== undefined;
    getMyTags()
      .then((myTags) => {
        setCached('myTags', myTags);
        if (!hasCachedTags) setSelectedTagIds(myTags.map((tag) => tag.id));
      })
      .catch(showApiError);
    getMyWalk()
      .then((walk) => {
        setCached('myWalk', walk);
        if (hasCachedWalk) return;
        const saved = fromWalkPreference(walk);
        setWalkTimes(saved.walkTimes);
        setWalkDuration(saved.walkDuration);
      })
      .catch(showApiError);
  }, []);

  /** 서버에 저장하고, 다음에 들어올 때 바로 보이게 기억해 둔 값도 바꾼다. tags는 이름까지 기억하려고 사전을 받는다 */
  const savePreferences = async (tags: Tag[], duration: WalkDuration) => {
    const walk = toWalkPreference(walkTimes, duration);
    await Promise.all([saveMyTags(selectedTagIds), saveMyWalk(walk)]);
    // 사전을 못 받은 채 저장해도 고른 해시태그가 빠지지 않게, 전에 기억해 둔 내 해시태그에서도 찾는다
    const knownTags = new Map([...(getCached('myTags') ?? []), ...tags].map((tag) => [tag.id, tag]));
    setCached(
      'myTags',
      selectedTagIds.flatMap((id) => knownTags.get(id) ?? []),
    );
    setCached('myWalk', walk);
  };

  return {
    selectedTagIds,
    setSelectedTagIds,
    walkTimes,
    setWalkTimes,
    walkDuration,
    setWalkDuration,
    savePreferences,
  };
}
