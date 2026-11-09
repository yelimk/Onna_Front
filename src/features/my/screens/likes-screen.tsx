import { router } from 'expo-router';
import { Fragment } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Icon } from '@/components/icon';
import { ScreenContainer } from '@/components/screen-container';
import { ScreenHeader } from '@/components/screen-header';
import { spacing } from '@/constants/layout';
import { ListDivider, PhotoListRow } from '@/features/my/components/photo-list-row';
import { toggleSpotLike, useLikedSpotIds } from '@/features/my/hooks/use-liked-spots';
import { useLikedSpotList } from '@/features/my/hooks/use-my-spots';

/**
 * ③ 마이 탭: 좋아요 내역. 좋아요는 공개 경쟁이 없어서 나만 볼 수 있다.
 * 리스트 ↔ 지도 전환 버튼은 디자이너 요청으로 뺐다 (지도 보기는 Figma에서 보류).
 */
export function LikesScreen() {
  const likedIds = useLikedSpotIds();
  // 하트를 취소해도 빈 하트로 남아 다시 누를 수 있고, 화면을 나갔다 다시 열면 그때 빠진다 (팀 결정)
  const listedSpots = useLikedSpotList() ?? [];

  return (
    <ScreenContainer
      contentTopGap={spacing.xs}
      header={<ScreenHeader title="좋아요 내역" />}>
      <View style={styles.caption}>
        <AppText variant="caption02" color="textTertiary">
          내가 좋아요한 자리는 나만 볼 수 있어요
        </AppText>
        <AppText variant="caption01">{likedIds.length}곳</AppText>
      </View>

      <View>
        {listedSpots.map((spot, index) => (
          <Fragment key={spot.postId}>
            {index > 0 && <ListDivider />}
            <PhotoListRow
              item={spot}
              onPress={() => router.push({ pathname: '/my/spot/[id]', params: { id: spot.postId } })}
              right={
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="좋아요"
                  accessibilityState={{ selected: likedIds.includes(spot.postId) }}
                  hitSlop={8}
                  onPress={() => toggleSpotLike(spot.postId)}>
                  <Icon name={likedIds.includes(spot.postId) ? 'heartFilled' : 'heart'} />
                </Pressable>
              }
            />
          </Fragment>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  caption: {
    flexDirection: 'row',
    gap: spacing.xxs,
    marginBottom: spacing.xs,
  },
});
