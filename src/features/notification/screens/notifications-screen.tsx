import { router } from 'expo-router';
import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { ScreenContainer } from '@/components/screen-container';
import { ScreenHeader } from '@/components/screen-header';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/layout';
import { NotificationRow } from '@/features/notification/components/notification-row';
import { useNotifications, type NotificationItem } from '@/features/notification/hooks/use-notifications';

/**
 * ③ 마이 탭: 알림. 푸시 알림은 1차에서 하지 않아서, 앱 안 알림 목록으로만 보여준다.
 * 알림을 누르면 그 기록의 상세로 간다. 마이 탭 안에서 열어서, 뒤로 가면 알림 화면으로 돌아온다.
 */
export function NotificationsScreen() {
  const { groups, unreadKeys, markRead } = useNotifications();

  const openRecord = (notification: NotificationItem) => {
    markRead(notification.key);
    router.push({ pathname: '/my/record/[id]', params: { id: String(notification.postId) } });
  };

  return (
    <ScreenContainer contentTopGap={spacing.xs} header={<ScreenHeader title="알림" />}>
      {groups?.length === 0 && (
        <AppText variant="body01" color="textTertiary">
          아직 받은 알림이 없어요. 누군가 내 자리를 열면 여기에서 알려 드려요.
        </AppText>
      )}
      <View style={styles.groups}>
        {(groups ?? []).map((group) => (
          <View key={group.label} style={styles.group}>
            <AppText variant="caption02" color="textTertiary">
              {group.label}
            </AppText>
            <View>
              {group.items.map((notification, index) => (
                <Fragment key={notification.key}>
                  {index > 0 && <View style={styles.divider} />}
                  <NotificationRow
                    notification={notification}
                    isUnread={unreadKeys.includes(notification.key)}
                    onPress={() => openRecord(notification)}
                  />
                </Fragment>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  groups: {
    gap: spacing.xl,
  },
  group: {
    gap: spacing.xxs,
  },
  // Figma 알림: 줄 사이 선 0.5, Gray/300
  divider: {
    height: 0.5,
    backgroundColor: colors.borderDeactivated,
  },
});
