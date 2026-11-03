import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Icon } from '@/components/icon';
import { colors } from '@/constants/colors';
import { pressedListScale, radius, spacing } from '@/constants/layout';
import type { MyPost } from '@/types/api';
import { formatDate } from '@/utils/format-date';
import { formatHashtag } from '@/utils/format-hashtag';

type RecordListItemProps = {
  post: MyPost;
  onPress: () => void;
  /** false면 날짜와 받은 좋아요 수를 뺀 간단한 모양 (Figma list simplified) */
  showMeta?: boolean;
};

/**
 * 내 기록 한 줄 (Figma list): 사진, 한 줄, 해시태그, 날짜, 받은 좋아요 수.
 * Figma에는 제목이 있지만 서버에 아직 제목이 없어서, 한 줄 코멘트를 제목 자리에 두 줄까지 보여준다.
 */
export function RecordListItem({ post, onPress, showMeta = true }: RecordListItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <Image source={{ uri: post.imageUrl }} style={styles.photo} contentFit="cover" />
      <View style={styles.body}>
        <View style={styles.top}>
          <View style={styles.texts}>
            <AppText variant="subtitle02" numberOfLines={2}>
              {post.oneLine}
            </AppText>
            <AppText variant="caption02" color="textTertiary" style={styles.hashtags}>
              {post.tags.map(formatHashtag).join(' ')}
            </AppText>
          </View>
          {showMeta && (
            <AppText variant="caption02" color="textDeactivated" style={styles.date}>
              {formatDate(post.createdAt)}
            </AppText>
          )}
        </View>
        {showMeta && (
          <View style={styles.likes}>
            <Icon name="heartSmall" size={16} color="textDeactivated" />
            <AppText variant="caption02" color="textDeactivated">
              {post.likeCount}
            </AppText>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  // 누르고 있으면 줄이 살짝 작아지고 회색 배경이 깔린다 (Figma list pressed)
  pressed: {
    backgroundColor: colors.background02,
    transform: [{ scale: pressedListScale }],
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: radius.md,
  },
  // 좋아요 수를 사진 아래쪽 끝에 맞추려고 위·아래로 벌린다
  body: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: spacing.xxs,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  texts: {
    flex: 1,
  },
  hashtags: {
    marginTop: spacing.xxs,
  },
  date: {
    paddingLeft: spacing.xs,
  },
  likes: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: spacing.xxs,
  },
});
