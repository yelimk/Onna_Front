import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { getMyNotifications } from '@/api/users';
import { getNotificationsSeenAt, useNotificationsSeenAt } from '@/features/notification/utils/notification-seen-at';
import { mockNotifications } from '@/mock/notifications';
import type { AppNotification } from '@/types/api';
import { getStartOfWeek } from '@/utils/week-range';

/**
 * 마이 탭 알림 종에 빨간 점을 붙일지. 알림 화면을 마지막으로 나간 뒤에 온 알림이 하나라도 있으면 true.
 * 새 알림이 왔는지 보려고 마이 화면에 들어올 때마다 목록을 다시 받고,
 * 알림 화면을 나가는 순간 시각이 바뀌면 바로 다시 센다 (마이 화면이 먼저 그려져도 점이 남지 않게).
 */
export function useHasNewNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const seenAt = useNotificationsSeenAt();

  useFocusEffect(
    useCallback(() => {
      getNotificationsSeenAt();
      getMyNotifications()
        .catch(() => [])
        // 알림 화면과 같게, 비어 있으면 예시 알림으로 센다 (시연 전에 지운다, mock/notifications.ts)
        .then((result) => setNotifications(result.length === 0 ? mockNotifications : result));
    }, []),
  );

  if (seenAt === undefined) return false;
  // 알림 화면은 이번 주 알림만 보여줘서, 그보다 오래된 알림으로는 점을 붙이지 않는다 (눌러도 볼 알림이 없게 되지 않도록)
  const startOfWeek = getStartOfWeek();
  return notifications.some((item) => {
    const time = new Date(item.createdAt).getTime();
    return time >= startOfWeek && time > seenAt;
  });
}
