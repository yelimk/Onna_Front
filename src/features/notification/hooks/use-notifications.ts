import { useEffect, useState } from 'react';

import { getMyNotifications } from '@/api/users';
import { getNotificationsSeenAt, markNotificationsSeen } from '@/features/notification/utils/notification-seen-at';
import { mockNotifications } from '@/mock/notifications';
import type { AppNotification } from '@/types/api';
import { parseServerDate } from '@/utils/parse-server-date';
import { getStartOfToday, getStartOfWeek } from '@/utils/week-range';

export type NotificationItem = AppNotification & {
  /** 서버 알림에 번호가 없어서 종류·기록·시각으로 만든 이름표. 같은 자리가 여러 번 열려도 겹치지 않는다 */
  key: string;
};

export type NotificationGroup = { label: string; items: NotificationItem[] };

/**
 * 서버는 최근 순으로 주고, '오늘'·'이번주' 묶음은 앱이 알림 시각으로 나눈다.
 * 이번주는 이번 주 월요일 0시부터다. Figma에 두 묶음만 있어서 그보다 오래된 알림은 보여주지 않는다 (팀 결정).
 */
function groupByPeriod(items: NotificationItem[]) {
  const startOfToday = getStartOfToday();
  const startOfWeek = getStartOfWeek();

  const labelOf = (createdAt: string) => {
    const time = parseServerDate(createdAt).getTime();
    if (time >= startOfToday) return '오늘';
    return time >= startOfWeek ? '이번주' : undefined;
  };

  const groups: NotificationGroup[] = [];
  for (const item of items) {
    const label = labelOf(item.createdAt);
    if (!label) continue;
    const last = groups.at(-1);
    if (last?.label === label) last.items.push(item);
    else groups.push({ label, items: [item] });
  }
  return groups;
}

/**
 * 알림 목록과 빨간 점(새 알림).
 * - 화면에 들어올 때, 지난번에 나간 시각보다 늦게 온 알림에 빨간 점을 붙인다.
 * - 알림을 눌러 기록을 보고 돌아오면 그 알림만 점이 사라지고, 안 본 알림은 그대로 남는다.
 * - 화면을 나가면 지금 시각을 적어 두어서, 다시 들어오면 모든 점이 사라진다.
 */
export function useNotifications() {
  const [groups, setGroups] = useState<NotificationGroup[]>([]);
  const [unreadKeys, setUnreadKeys] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([getMyNotifications().catch(() => []), getNotificationsSeenAt()]).then(([result, seenAt]) => {
      // 비어 있으면 Figma 예시를 대신 보여준다 (시연 전에 지운다, mock/notifications.ts)
      const notifications = result.length === 0 ? mockNotifications : result;
      const items = notifications.map((item) => ({ ...item, key: `${item.type}-${item.postId}-${item.createdAt}` }));
      setGroups(groupByPeriod(items));
      setUnreadKeys(items.filter((item) => parseServerDate(item.createdAt).getTime() > seenAt).map((item) => item.key));
    });
    return markNotificationsSeen;
  }, []);

  const markRead = (key: string) => setUnreadKeys((keys) => keys.filter((item) => item !== key));

  return { groups, unreadKeys, markRead };
}
