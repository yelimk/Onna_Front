import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Icon } from '@/components/icon';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/layout';
import type { TypographyVariant } from '@/constants/typography';
import type { MyPost } from '@/types/api';
import { formatDate } from '@/utils/format-date';
import { formatHashtag } from '@/utils/format-hashtag';

type RecordListItemProps = {
  post: MyPost;
  onPress: () => void;
  /** false면 날짜와 받은 좋아요 수를 뺀 간단한 모양 (Figma list simplified) */
  showMeta?: boolean;
};

// 누르고 있으면 사진과 글자가 한 단계씩 작아진다 (Figma list default → pressed)
const sizes = {
  default: { photo: 120, title: 'subtitle02', comment: 'body01', meta: 'caption02' },
  pressed: { photo: 100, title: 'subtitle03', comment: 'body02', meta: 'caption04' },
} satisfies Record<string, { photo: number; title: TypographyVariant; comment: TypographyVariant; meta: TypographyVariant }>;

/**
 * 내 기록 한 줄 (Figma list): 사진, 굵은 제목(한 줄), 한 줄 코멘트(두 줄까지, 넘치면 '…'), 해시태그, 날짜, 받은 좋아요 수.
 * 서버에 아직 제목이 없어서 제목이 없는 기록은 제목 줄 없이 코멘트부터 보여준다.
 * 누르고 있으면 회색 칸 안으로 줄어든다. 줄 높이는 그대로라 아래 목록이 흔들리지 않는다.
 */
export function RecordListItem({ post, onPress, showMeta = true }: RecordListItemProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.row}>
      {({ pressed }) => {
        const size = sizes[pressed ? 'pressed' : 'default'];
        return (
          <View style={[styles.content, pressed && styles.pressedContent]}>
            <Image
              source={{ uri: post.imageUrl }}
              style={[styles.photo, { width: size.photo, height: size.photo }]}
              contentFit="cover"
            />
            <View style={[styles.body, { height: size.photo }]}>
              <View style={styles.top}>
                <View style={styles.texts}>
                  {post.title && (
                    <AppText variant={size.title} numberOfLines={1}>
                      {post.title}
                    </AppText>
                  )}
                  <AppText variant={size.comment} numberOfLines={2}>
                    {post.oneLine}
                  </AppText>
                  <AppText variant={size.meta} color="textTertiary" style={styles.hashtags}>
                    {post.tags.map(formatHashtag).join(' ')}
                  </AppText>
                </View>
                {showMeta && (
                  <AppText variant={size.meta} color="textDeactivated" style={styles.date}>
                    {formatDate(post.createdAt)}
                  </AppText>
                )}
              </View>
              {showMeta && (
                <View style={styles.likes}>
                  <Icon name="heartSmall" size={16} color="textDeactivated" />
                  <AppText variant={size.meta} color="textDeactivated">
                    {post.likeCount}
                  </AppText>
                </View>
              )}
            </View>
          </View>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // 기본 사진(120)과 위아래 여백(12)으로 정해지는 줄 높이. 눌러서 사진이 작아져도 이 높이를 지킨다.
  row: {
    height: 120 + spacing.sm * 2,
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  // Figma pressed: 줄 양옆을 8씩 줄인 회색 칸, 안쪽 여백 8
  pressedContent: {
    marginHorizontal: spacing.xs,
    padding: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.background02,
  },
  photo: {
    borderRadius: radius.md,
  },
  // 글 칸 높이를 사진과 똑같이 고정해서, 글이 길든 짧든 줄마다 높이와 좋아요 위치가 같게 한다
  body: {
    flex: 1,
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
  // 좋아요 수는 글 길이와 상관없이 늘 사진 아래쪽 끝, 오른쪽에 붙인다 (Figma list)
  likes: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
});
