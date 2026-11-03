import { router } from 'expo-router';
import { Fragment, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { AreaMapView } from '@/components/area-map-view';
import { ScreenContainer } from '@/components/screen-container';
import { ScreenHeader } from '@/components/screen-header';
import { SegmentedToggle } from '@/components/segmented-toggle';
import { colors } from '@/constants/colors';
import { RecordListItem } from '@/features/record/components/record-list-item';
import { useMyPosts } from '@/hooks/use-my-posts';
import { mockMyRecordAreas } from '@/mock/my-records';

const viewModes = ['리스트', '지도'] as const;
type ViewMode = (typeof viewModes)[number];

/**
 * ② 기록 탭: 내 기록. 지도가 비어 있어도 혼자 쓸 이유가 되도록 내가 남긴 자리를 모아 본다.
 * 새로 남기기는 지도의 카메라 버튼에서 시작한다. '지도' 보기는 Figma에서 보류라 가짜 구역을 그린 회색 지도를 그대로 둔다.
 */
export function RecordScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('리스트');
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const { posts, hasFailed, reload } = useMyPosts();

  return (
    <ScreenContainer
      withBottomInset={false}
      header={
        <ScreenHeader
          title="내 기록"
          showBack={false}
          right={<SegmentedToggle options={viewModes} selected={viewMode} onSelect={setViewMode} />}
        />
      }>

      {viewMode === '리스트' ? (
        <View>
          {hasFailed && (
            <Pressable onPress={reload} hitSlop={8}>
              <AppText variant="caption02" color="textTertiary">
                기록을 불러오지 못했어요. 눌러서 다시 불러오기
              </AppText>
            </Pressable>
          )}
          {posts?.length === 0 && (
            <AppText variant="body01" color="textTertiary">
              아직 남긴 자리가 없어요. 지도의 카메라 버튼으로 첫 자리를 남겨 보세요.
            </AppText>
          )}
          {posts?.map((post, index) => (
            <Fragment key={post.postId}>
              {index > 0 && <View style={styles.divider} />}
              <RecordListItem post={post} onPress={() => router.push(`/record/${post.postId}`)} />
            </Fragment>
          ))}
        </View>
      ) : (
        <AreaMapView areas={mockMyRecordAreas} selectedAreaId={selectedAreaId} onSelectArea={setSelectedAreaId} />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: colors.disabledBackground,
  },
});
