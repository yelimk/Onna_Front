import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/layout';
import type { AppNotification } from '@/types/api';

// Figma 알림 문구. 누가 열었는지, 몇 명인지는 보여주지 않는다.
const messages: Record<AppNotification['type'], string> = {
  OPENED: '누군가 당신의 순간에 다녀갔어요',
  TEASER: '이 순간이 구역 대표 사진이 되었어요',
};

type NotificationRowProps = {
  notification: AppNotification;
  isUnread: boolean;
  onPress: () => void;
};

/**
 * 알림 한 줄 (Figma alert). 아래 줄은 내가 남긴 한 줄을 따옴표로 묶어 보여준다. 새 알림은 오른쪽 위에 빨간 점이 붙는다.
 * 서버가 아직 한 줄을 주지 않아서(백엔드에 요청함), 한 줄이 없으면 기록 제목을 대신 보여준다.
 */
export function NotificationRow({ notification, isUnread, onPress }: NotificationRowProps) {
  return (
    <Pressable accessibilityRole="button" style={styles.row} onPress={onPress}>
      <Image source={{ uri: notification.imageUrl }} style={styles.photo} contentFit="cover" />
      <View style={styles.texts}>
        <AppText variant="subtitle04" numberOfLines={1}>
          {messages[notification.type]}
        </AppText>
        <AppText variant="caption04" color="textTertiary" numberOfLines={1}>
          {`“${notification.oneLine ?? notification.title}”`}
        </AppText>
      </View>
      {isUnread && <View style={styles.unreadDot} />}
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
