import { router } from 'expo-router';
import { Fragment, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { AreaMapView } from '@/components/area-map-view';
import { Icon } from '@/components/icon';
import { ScreenContainer } from '@/components/screen-container';
import { ScreenHeader } from '@/components/screen-header';
import { SegmentedToggle } from '@/components/segmented-toggle';
import { spacing } from '@/constants/layout';
import { ListDivider, PhotoListRow } from '@/features/my/components/photo-list-row';
import { mockLikedAreas, mockLikedSpots, mockMyStats } from '@/mock/my-activity';

const viewModes = ['리스트', '지도'] as const;
type ViewMode = (typeof viewModes)[number];

/**
 * ③ 마이 탭: 좋아요 내역. 좋아요는 공개 경쟁이 없어서 나만 볼 수 있다.
 * '지도' 보기는 Figma에서 보류라 와이어프레임 회색 지도를 그대로 둔다.
 */
export function LikesScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('리스트');
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  // 좋아요 API가 아직 없어서 하트를 눌러 취소한 자리를 화면 안에서만 기억한다
  const [unlikedIds, setUnlikedIds] = useState<string[]>([]);
  const toggleLike = (spotId: string) =>
    setUnlikedIds((ids) => (ids.includes(spotId) ? ids.filter((id) => id !== spotId) : [...ids, spotId]));

  return (
    <ScreenContainer
      contentTopGap={spacing.xs}
      header={
        <ScreenHeader
          title="좋아요 내역"
          right={<SegmentedToggle options={viewModes} selected={viewMode} onSelect={setViewMode} />}
        />
      }>
      <View style={styles.caption}>
        <AppText variant="caption02" color="textTertiary">
          내가 좋아요한 자리는 나만 볼 수 있어요
        </AppText>
        <AppText variant="caption01">{mockMyStats.likedCount}곳</AppText>
      </View>

      {viewMode === '리스트' ? (
        <View>
          {mockLikedSpots.map((spot, index) => (
            <Fragment key={spot.spotId}>
              {index > 0 && <ListDivider />}
              <PhotoListRow
                item={spot}
                onPress={() => router.push({ pathname: '/my/spot/[id]', params: { id: spot.spotId } })}
                right={
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="좋아요"
                    accessibilityState={{ selected: !unlikedIds.includes(spot.spotId) }}
                    hitSlop={8}
                    onPress={() => toggleLike(spot.spotId)}>
                    <Icon name={unlikedIds.includes(spot.spotId) ? 'heart' : 'heartFilled'} />
                  </Pressable>
                }
              />
            </Fragment>
          ))}
        </View>
      ) : (
        <AreaMapView areas={mockLikedAreas} selectedAreaId={selectedAreaId} onSelectArea={setSelectedAreaId} />
      )}
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
