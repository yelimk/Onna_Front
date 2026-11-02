import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Icon } from '@/components/icon';
import { ScreenContainer } from '@/components/screen-container';
import { ScreenHeader } from '@/components/screen-header';
import { colors } from '@/constants/colors';
import { photoShadow, radius, spacing } from '@/constants/layout';
import { useMyPosts } from '@/hooks/use-my-posts';
import { formatDate } from '@/utils/format-date';
import { formatHashtag } from '@/utils/format-hashtag';

/**
 * ② 기록 탭: 내 기록 상세. 사진은 앱 카메라 비율(세로 3:4) 그대로 크게 보여준다.
 * 기록 하나만 받는 API가 없어서 내 기록 목록을 다시 받아 id로 찾는다 (사진 주소도 새로 받게 된다).
 * 제목은 서버에 아직 없어서 머리글에 남긴 날짜를 보여준다.
 */
export function RecordDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { posts } = useMyPosts();
  const post = posts?.find((item) => String(item.postId) === id);

  // 목록을 받기 전에는 머리글만 보여준다
  if (!post) {
    return <ScreenContainer header={<ScreenHeader title="" />}>{null}</ScreenContainer>;
  }

  return (
    <ScreenContainer
      withBottomInset={false}
      header={
        <ScreenHeader
          title={formatDate(post.createdAt)}
          right={
            <Pressable accessibilityLabel="신고하기" hitSlop={8} onPress={() => router.push(`/report/${post.postId}`)}>
              <Icon name="report" size={28} />
            </Pressable>
          }
        />
      }>
      <View style={styles.photoBox}>
        <Image source={{ uri: post.imageUrl }} style={styles.photo} contentFit="cover" />
        <View style={styles.heart}>
          <Icon name="heartFilled" size={32} />
        </View>
      </View>

      <View style={styles.texts}>
        <AppText variant="body01">{post.oneLine}</AppText>
        <View style={styles.hashtags}>
          {post.tags.map((tag) => (
            <View key={tag} style={styles.hashtag}>
              <AppText variant="caption02" color="textSecondary">
                {formatHashtag(tag)}
              </AppText>
            </View>
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  photoBox: {
    aspectRatio: 3 / 4,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  photo: {
    flex: 1,
  },
  heart: {
    ...photoShadow,
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
  },
  texts: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  hashtags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  hashtag: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    borderRadius: radius.sm,
    backgroundColor: colors.background02,
  },
});
