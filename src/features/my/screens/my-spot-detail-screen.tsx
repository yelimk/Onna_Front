import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Icon } from '@/components/icon';
import { LikeButton } from '@/components/like-button';
import { ScreenContainer } from '@/components/screen-container';
import { ScreenHeader } from '@/components/screen-header';
import { showToast } from '@/components/toast';
import { colors } from '@/constants/colors';
import { toggleSpotLike, useLikedSpotIds } from '@/features/my/hooks/use-liked-spots';
import { radius, spacing } from '@/constants/layout';
import { mockLikedSpots, mockOpenedHistory, mockSpotDetails } from '@/mock/my-activity';

// Figma 좋아요 내역 상세: 오른쪽 위 신고 버튼(동그라미) 36
const reportButtonSize = 36;

/**
 * ③ 마이 탭: 좋아요 내역·연 자리 기록에서 사진을 누르면 보이는 상세 (Figma 좋아요 내역 상세).
 * 두 목록이 같은 상세 화면을 쓴다. 좋아요·신고 API가 아직 없어서 화면 안에서만 바뀐다.
 * 신고는 서버 없이 화면만 두기로 해서(팀 결정) 빨간 사이렌을 누르면 접수 토스트만 띄운다. 한 번 신고하면 다시 띄우지 않는다.
 */
export function MySpotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const spot =
    mockLikedSpots.find((item) => item.spotId === id) ??
    mockOpenedHistory.flatMap((group) => group.items).find((item) => item.spotId === id);
  const detail = id ? mockSpotDetails[id] : undefined;
  const likedIds = useLikedSpotIds();
  const [isReported, setIsReported] = useState(false);

  if (!spot || !detail) {
    return <ScreenContainer header={<ScreenHeader />}>{null}</ScreenContainer>;
  }

  const report = () => {
    if (isReported) return;
    setIsReported(true);
    showToast('신고가 접수되었습니다');
  };

  return (
    <ScreenContainer
      contentTopGap={0}
      header={
        <ScreenHeader
          center={
            <AppText variant="subtitle02" numberOfLines={1}>
              {spot.title}
            </AppText>
          }
          right={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="신고하기"
              onPress={report}
              style={styles.reportButton}>
              <Icon name="reportRed" />
            </Pressable>
          }
        />
      }>
      <View style={styles.content}>
        <View style={styles.post}>
          <View style={styles.photoBox}>
            <Image source={spot.photo} style={styles.photo} contentFit="cover" />
          </View>

          <View style={styles.texts}>
            <AppText variant="body01">{detail.oneLine}</AppText>
            <AppText variant="caption02" color="textDeactivated">
              {detail.dateLabel}
            </AppText>
            <View style={styles.hashtags}>
              {spot.hashtags.map((hashtag) => (
                <View key={hashtag} style={styles.hashtag}>
                  <AppText variant="caption02" color="textSecondary">
                    {hashtag}
                  </AppText>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 좋아요 내역 목록과 같은 상태를 써서, 여기서 취소하면 목록 하트도 같이 바뀐다 */}
        <LikeButton liked={id ? likedIds.includes(id) : false} onPress={() => id && toggleSpotLike(id)} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  // Figma: 사진·글 묶음과 좋아요 버튼 사이 20, 사진과 글 사이 16
  content: {
    gap: spacing.lg,
  },
  post: {
    gap: spacing.md,
  },
  // Figma 수정: 사진 모서리 12 (기록 상세와 같게)
  photoBox: {
    aspectRatio: 3 / 4,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  photo: {
    flex: 1,
  },
  reportButton: {
    width: reportButtonSize,
    height: reportButtonSize,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
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
