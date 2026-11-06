import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { interpolate, interpolateColor, useAnimatedStyle } from 'react-native-reanimated';

import { AppText } from '@/components/app-text';
import { Icon } from '@/components/icon';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/layout';
import { duration } from '@/constants/motion';
import type { TypographyVariant } from '@/constants/typography';
import { usePressProgress } from '@/hooks/use-press-progress';
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
 * 줄 높이는 사진(120)에 맞춘 144가 기본이다. 코멘트가 두 줄이라 글이 사진보다 길어지면 Figma처럼 그 줄만 길어져서,
 * 해시태그와 좋아요 수가 겹치지 않는다.
 * 누르고 있으면 회색 칸 안으로 줄어든다. 줄 높이는 그대로라 아래 목록이 흔들리지 않는다.
 * 줄어드는 움직임은 100ms 동안 이어진다 (Figma 프로토타입 list pressed: 스마트 애니메이트 100ms, Ease out).
 * 글자 크기는 앱에서 부드럽게 바꿀 수 없어서 누르는 순간 바뀐다.
 */
export function RecordListItem({ post, onPress, showMeta = true }: RecordListItemProps) {
  const { progress, isPressed, pressHandlers } = usePressProgress(duration.press);
  const size = sizes[isPressed ? 'pressed' : 'default'];

  const contentStyle = useAnimatedStyle(() => ({
    marginHorizontal: progress.get() * spacing.xs,
    padding: progress.get() * spacing.xs,
    backgroundColor: interpolateColor(progress.get(), [0, 1], [colors.background01, colors.background02]),
  }));
  const photoStyle = useAnimatedStyle(() => {
    const photoSize = interpolate(progress.get(), [0, 1], [sizes.default.photo, sizes.pressed.photo]);
    return { width: photoSize, height: photoSize };
  });
  // 글 칸은 적어도 사진 높이만큼 두고 사진과 같이 줄인다. 글이 더 길면 그만큼 늘어난다
  const bodyStyle = useAnimatedStyle(() => ({
    minHeight: interpolate(progress.get(), [0, 1], [sizes.default.photo, sizes.pressed.photo]),
  }));

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.row} {...pressHandlers}>
      <Animated.View style={[styles.content, contentStyle]}>
        <Animated.View style={[styles.photo, photoStyle]}>
          <Image source={{ uri: post.imageUrl }} style={styles.photoImage} contentFit="cover" />
        </Animated.View>
        <Animated.View style={[styles.body, bodyStyle]}>
          <View>
            {/* 날짜는 제목 줄 옆에만 둔다. 글 전체 옆에 두면 날짜(2026.08.28) 너비만큼 코멘트 칸이 좁아져 줄이 일찍 꺾인다 */}
            <View style={styles.titleRow}>
              <View style={styles.title}>
                {post.title && (
                  <AppText variant={size.title} numberOfLines={1}>
                    {post.title}
                  </AppText>
                )}
              </View>
              {showMeta && (
                <AppText variant={size.meta} color="textDeactivated" style={styles.date}>
                  {formatDate(post.createdAt)}
                </AppText>
              )}
            </View>
            <AppText variant={size.comment} numberOfLines={2}>
              {post.oneLine}
            </AppText>
            <AppText variant={size.meta} color="textTertiary" style={styles.hashtags}>
              {post.tags.map(formatHashtag).join(' ')}
            </AppText>
          </View>
          {showMeta && (
            <View style={styles.likes}>
              <Icon name="heartSmall" size={16} color="textDeactivated" />
              <AppText variant={size.meta} color="textDeactivated">
                {post.likeCount}
              </AppText>
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // 기본 사진(120)과 위아래 여백(12)으로 정해지는 줄 높이. 눌러서 사진이 작아져도 이 높이보다 작아지지 않는다.
  row: {
    minHeight: 120 + spacing.sm * 2,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
  },
  // Figma pressed: 줄 양옆을 8씩 줄인 회색 칸, 안쪽 여백 8 (contentStyle이 0에서 이 값까지 움직인다)
  // 글이 사진보다 길어지면 사진은 Figma처럼 줄 가운데에 둔다
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.md,
  },
  photo: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  photoImage: {
    flex: 1,
  },
  // 위는 제목·코멘트·해시태그, 아래 끝은 좋아요 수. 글이 짧아도 좋아요 수는 사진 아래 끝에 맞춘다
  body: {
    flex: 1,
    paddingTop: spacing.xxs,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
  },
  hashtags: {
    marginTop: spacing.xxs,
  },
  date: {
    paddingLeft: spacing.xs,
  },
  // 좋아요 수는 오른쪽 아래 끝에 붙인다. 글 아래에 따로 자리를 차지해서 해시태그와 겹치지 않는다 (Figma list)
  likes: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
});
