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
import { radius, spacing } from '@/constants/layout';
import { ReportOverlay } from '@/features/my/components/report-overlay';
import { toggleSpotLike, useLikedSpotIds } from '@/features/my/hooks/use-liked-spots';
import { findMySpot } from '@/features/my/hooks/use-my-spots';
import { formatDate } from '@/utils/format-date';

// Figma 좋아요 내역 상세: 오른쪽 위 신고 버튼(동그라미) 36
const reportButtonSize = 36;

/**
 * ③ 마이 탭: 좋아요 내역·연 자리 기록에서 사진을 누르면 보이는 상세 (Figma 좋아요 내역 상세).
 * 두 목록이 같은 상세 화면을 쓰고, 목록에서 받은 값을 그대로 보여준다.
 * 목록 API에 한 줄 코멘트가 아직 없어서(백엔드에 요청함), 서버가 줄 때만 코멘트 줄을 보여준다.
 * 신고: 빨간 사이렌을 누르면 지도와 같은 신고 창이 올라오고(Figma 주석 '홈화면 플로우 참고'),
 * 사유를 골라 '신고하기'를 누르면 창이 내려가며 '신고가 접수되었습니다' 토스트가 뜬다(Figma GUI 좋아요 내역 상세).
 * 신고 API가 없어서(팀 결정) 서버에는 보내지 않는다. 한 번 신고하면 다시 띄우지 않는다.
 */
export function MySpotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const spot = findMySpot(Number(id));
  const likedIds = useLikedSpotIds();
  const [isReported, setIsReported] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  if (!spot) {
    return <ScreenContainer header={<ScreenHeader />}>{null}</ScreenContainer>;
  }

  const openReport = () => {
    if (isReported) return;
    setIsReporting(true);
  };

  // 신고 API가 나오면 고른 사유를 서버로 보낸다
  const submitReport = () => {
    setIsReporting(false);
    setIsReported(true);
    // Figma에는 신고 토스트 움직임이 없어서, 같은 '한 번 누르고 결과만 알려주는' 기록 삭제 토스트와 같이 움직인다
    showToast('신고가 접수되었습니다', 'plain', 'brief');
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
              onPress={openReport}
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
            {spot.oneLine && <AppText variant="body01">{spot.oneLine}</AppText>}
            <AppText variant="caption02" color="textDeactivated">
              {formatDate(spot.date)}
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
        <LikeButton liked={likedIds.includes(spot.postId)} onPress={() => toggleSpotLike(spot.postId)} />
      </View>

      <ReportOverlay visible={isReporting} onClose={() => setIsReporting(false)} onSubmit={submitReport} />
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
