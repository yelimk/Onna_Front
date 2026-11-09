import { useEffect, useState } from 'react';

import { getMyNotifications } from '@/api/users';
import { getNotificationsSeenAt, markNotificationsSeen } from '@/features/notification/utils/notification-seen-at';
import type { AppNotification } from '@/types/api';
import { formatRelativeTime } from '@/utils/format-relative-time';
import { parseServerDate } from '@/utils/parse-server-date';

export type NotificationItem = AppNotification & {
  /** 서버 알림에 번호가 없어서 종류·기록·시각으로 만든 이름표. 같은 자리가 여러 번 열려도 겹치지 않는다 */
  key: string;
};

export type NotificationGroup = { label: string; items: NotificationItem[] };

/**
 * 서버는 최근 순으로 주고(최대 50개), 앱이 알림 시각으로 묶는다.
 * 묶음 제목은 '5분 전', '3시간 전', '2일 전', '일주일 전', '2주 전', '3달 전', '작년', '재작년', '2023'처럼
 * 지금과의 차이로 쓰고, 같은 제목끼리 모은다 (디자이너 요청. 전에는 '오늘'·'이번주'만 보여줬다).
 * 화면에 들어올 때의 시각으로 한 번 계산한다. 화면을 켜 둔 채로는 바뀌지 않고, 다시 들어오면 새로 계산한다.
 */
function groupByTime(items: NotificationItem[]) {
  const now = new Date();
  const groups: NotificationGroup[] = [];
  for (const item of items) {
    const label = formatRelativeTime(item.createdAt, now);
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
  // null이면 아직 받는 중이다 (빈 알림 안내를 받기 전에 띄우지 않으려고 나눈다)
  const [groups, setGroups] = useState<NotificationGroup[] | null>(null);
  const [unreadKeys, setUnreadKeys] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([getMyNotifications().catch(() => []), getNotificationsSeenAt()]).then(([result, seenAt]) => {
      const items = result.map((item) => ({ ...item, key: `${item.type}-${item.postId}-${item.createdAt}` }));
      setGroups(groupByTime(items));
      setUnreadKeys(items.filter((item) => parseServerDate(item.createdAt).getTime() > seenAt).map((item) => item.key));
    });
    return markNotificationsSeen;
  }, []);

  const markRead = (key: string) => setUnreadKeys((keys) => keys.filter((item) => item !== key));

  return { groups, unreadKeys, markRead };
}
