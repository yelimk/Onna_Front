import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { deletePost } from '@/api/posts';
import { AppText } from '@/components/app-text';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Icon } from '@/components/icon';
import { PressHighlight } from '@/components/press-highlight';
import { ScreenContainer } from '@/components/screen-container';
import { ScreenHeader } from '@/components/screen-header';
import { showToast } from '@/components/toast';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/layout';
import { duration } from '@/constants/motion';
import { useMyPosts } from '@/hooks/use-my-posts';
import { formatDate } from '@/utils/format-date';
import { formatHashtag } from '@/utils/format-hashtag';
import { showApiError } from '@/utils/show-api-error';

// Figma 기록 상세 오른쪽 위 삭제 버튼(동그라미) 크기
const deleteButtonSize = 36;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * ② 기록 탭: 내 기록 상세. 사진은 앱 카메라 비율(세로 3:4) 그대로 크게 보여준다.
 * 기록 하나만 받는 API가 없어서 내 기록 목록을 다시 받아 id로 찾는다 (사진 주소도 새로 받게 된다).
 * 머리글 가운데는 기록 제목이다. 제목이 필수가 되기 전에 올린 기록은 제목이 없어서 비워 둔다.
 * 마이 탭 알림에서도 이 화면을 연다(/my/record/[id]). 그래야 뒤로 가면 알림 화면으로 돌아온다.
 * 오른쪽 위 휴지통으로 한 번 더 물은 뒤 지운다.
 */
export function RecordDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { posts } = useMyPosts();
  const post = posts?.find((item) => String(item.postId) === id);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // 목록을 받기 전에는 머리글만 보여준다
  if (!post) {
    return <ScreenContainer header={<ScreenHeader />}>{null}</ScreenContainer>;
  }

  const removePost = async () => {
    setIsConfirmingDelete(false);
    try {
      // Figma 기록탭 프로토타입: 확인 창이 180ms 동안 사라진 뒤 목록으로 돌아가고, 목록 위로 '삭제되었습니다'가 내려온다.
      // 지우는 요청이 창이 사라지기 전에 끝나도 창이 다 사라질 때까지 기다린다
      await Promise.all([deletePost(post.postId), wait(duration.change)]);
      router.back();
      // 목록은 화면에 돌아오면 다시 받아서, 지운 기록은 빠져 있다 (use-my-posts.ts)
      showToast('삭제되었습니다', 'success', 'brief');
    } catch (error) {
      showApiError(error);
    }
  };

  return (
    <ScreenContainer
      contentTopGap={0}
      header={
        <ScreenHeader
          center={
            post.title ? (
              <AppText variant="subtitle02" numberOfLines={1}>
                {post.title}
              </AppText>
            ) : undefined
          }
          right={
            // 누르고 있으면 옅은 회색 동그라미가 100ms 동안 서서히 깔린다 (Figma 삭제 버튼 pressed: 디졸브 100ms)
            <PressHighlight
              accessibilityRole="button"
              accessibilityLabel="기록 삭제"
              onPress={() => setIsConfirmingDelete(true)}
              style={styles.deleteButton}>
              <Icon name="trash" />
            </PressHighlight>
          }
        />
      }>
      <View style={styles.photoBox}>
        <Image source={{ uri: post.imageUrl }} style={styles.photo} contentFit="cover" />
      </View>

      <View style={styles.texts}>
        <AppText variant="body01">{post.oneLine}</AppText>
        <AppText variant="caption02" color="textDeactivated">
          {formatDate(post.createdAt)}
        </AppText>
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

      <ConfirmDialog
        visible={isConfirmingDelete}
        title="삭제하시겠습니까?"
        description="삭제한 기록은 다시 복구할 수 없어요"
        confirmLabel="삭제"
        onCancel={() => setIsConfirmingDelete(false)}
        onConfirm={removePost}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  photoBox: {
    aspectRatio: 3 / 4,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  photo: {
    flex: 1,
  },
  deleteButton: {
    width: deleteButtonSize,
    height: deleteButtonSize,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
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
