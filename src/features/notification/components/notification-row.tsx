import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/layout';
import type { AppNotification } from '@/mock/notifications';

type NotificationRowProps = {
  notification: AppNotification;
  onPress: () => void;
};

/** 알림 한 줄 (Figma alert). 아래 줄은 내가 남긴 한 줄을 따옴표로 묶어 보여준다. 안 읽은 알림은 오른쪽 위에 빨간 점이 붙는다. 누가 눌렀는지, 몇 명인지는 보여주지 않는다. */
export function NotificationRow({ notification, onPress }: NotificationRowProps) {
  return (
    <Pressable accessibilityRole="button" style={styles.row} onPress={onPress}>
      <Image source={notification.photo} style={styles.photo} contentFit="cover" />
      <View style={styles.texts}>
        <AppText variant="subtitle04" numberOfLines={1}>
          {notification.title}
        </AppText>
        <AppText variant="caption04" color="textTertiary" numberOfLines={1}>
          {`“${notification.detail}”`}
        </AppText>
      </View>
      {notification.isUnread && <View style={styles.unreadDot} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  // 사진·글자 줄과 따로 오른쪽 위 끝에 붙인다
  unreadDot: {
    alignSelf: 'flex-start',
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.error,
  },
  texts: {
    flex: 1,
    gap: spacing.xxs,
  },
  photo: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
  },
});
