import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { getMyNotifications } from '@/api/users';
import { getNotificationsSeenAt } from '@/features/notification/utils/notification-seen-at';
import { mockNotifications } from '@/mock/notifications';
import { parseServerDate } from '@/utils/parse-server-date';
import { getStartOfWeek } from '@/utils/week-range';

/**
 * 마이 탭 종 버튼의 빨간 점. 알림 화면에서 빨간 점이 붙을 알림이 하나라도 있으면 true.
 * 알림 화면과 같은 기준이다: 알림 화면을 마지막으로 나간 뒤 온 알림 중, 화면에 보이는 이번주(월요일 0시부터) 알림만 센다.
 * 알림을 보고 돌아오면 점이 사라져야 해서, 마이 탭에 돌아올 때마다 다시 확인한다.
 */
export function useHasNewNotifications() {
  const [hasNew, setHasNew] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      Promise.all([getMyNotifications().catch(() => []), getNotificationsSeenAt()]).then(([result, seenAt]) => {
        // 알림 화면과 같게, 비어 있으면 Figma 예시로 센다 (시연 전에 지운다, mock/notifications.ts)
        const notifications = result.length === 0 ? mockNotifications : result;
        const startOfWeek = getStartOfWeek();
        const found = notifications.some((item) => {
          const time = parseServerDate(item.createdAt).getTime();
          return time >= startOfWeek && time > seenAt;
        });
        if (isActive) setHasNew(found);
      });
      return () => {
        isActive = false;
      };
    }, []),
  );

  return hasNew;
}
