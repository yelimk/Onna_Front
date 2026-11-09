import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle } from 'react-native-reanimated';

import { AppText } from '@/components/app-text';
import { Icon } from '@/components/icon';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/layout';
import { duration } from '@/constants/motion';
import { usePressProgress } from '@/hooks/use-press-progress';
import type { MyPost } from '@/types/api';
import { formatShortDate } from '@/utils/format-date';
import { formatHashtag } from '@/utils/format-hashtag';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Figma list: 사진 120
const photoSize = 120;

type RecordListItemProps = {
  post: MyPost;
  onPress: () => void;
  /** false면 날짜와 받은 좋아요 수를 뺀 간단한 모양 (Figma list simplified) */
  showMeta?: boolean;
};

/**
 * 내 기록 한 줄 (Figma list): 사진, 굵은 제목(한 줄), 한 줄 코멘트(두 줄까지, 넘치면 '…'), 해시태그, 날짜, 받은 좋아요 수.
 * 줄 높이는 사진(120)에 맞춘 144가 기본이다. 코멘트가 두 줄이라 글이 사진보다 길어지면 Figma처럼 그 줄만 길어져서,
 * 해시태그와 좋아요 수가 겹치지 않는다.
 * 누르고 있으면 줄 배경만 회색으로 서서히 바뀐다(100ms). 사진·글자가 작아지는 움직임은 디자이너 요청으로 뺐다
 * (내 기록·좋아요 내역 목록만. 마이 탭 내 활동 메뉴는 작아지는 움직임을 그대로 둔다).
 */
export function RecordListItem({ post, onPress, showMeta = true }: RecordListItemProps) {
  const { progress, pressHandlers } = usePressProgress(duration.press);
  const rowStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.get(), [0, 1], [colors.background01, colors.background02]),
  }));

  return (
    <AnimatedPressable accessibilityRole="button" onPress={onPress} style={[styles.row, rowStyle]} {...pressHandlers}>
      <View style={styles.photo}>
        <Image source={{ uri: post.imageUrl }} style={styles.photoImage} contentFit="cover" />
      </View>
      <View style={styles.body}>
        <View>
          {/* 날짜는 제목 줄 옆에만 둔다. 글 전체 옆에 두면 날짜 너비만큼 코멘트 칸이 좁아져 줄이 일찍 꺾인다.
              제목이 길어서 겹치면 날짜가 먼저다: 날짜는 줄어들지 않고, 제목이 '…'로 잘린다 (디자이너 요청) */}
          <View style={styles.titleRow}>
            <View style={styles.title}>
              {post.title && (
                <AppText variant="subtitle02" numberOfLines={1}>
                  {post.title}
                </AppText>
              )}
            </View>
            {showMeta && (
              <AppText variant="caption02" color="textDeactivated" style={styles.date}>
                {formatShortDate(post.createdAt)}
              </AppText>
            )}
          </View>
          <AppText variant="body01" numberOfLines={2}>
            {post.oneLine}
          </AppText>
          <AppText variant="caption02" color="textTertiary" style={styles.hashtags}>
            {post.tags.map(formatHashtag).join(' ')}
          </AppText>
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
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  // 사진(120)과 위아래 여백(12)으로 정해지는 줄 높이. 누른 동안 이 줄 전체가 회색 칸이 된다.
  // 글이 사진보다 길어지면 사진은 Figma처럼 줄 가운데에 둔다
  row: {
    minHeight: photoSize + spacing.sm * 2,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.md,
  },
  photo: {
    width: photoSize,
    height: photoSize,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  photoImage: {
    flex: 1,
  },
  // 위는 제목·코멘트·해시태그, 아래 끝은 좋아요 수. 글이 짧아도 좋아요 수는 사진 아래 끝에 맞춘다
  body: {
    flex: 1,
    minHeight: photoSize,
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
    flexShrink: 0,
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
