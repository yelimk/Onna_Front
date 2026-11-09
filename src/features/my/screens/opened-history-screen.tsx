import { router } from 'expo-router';
import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { ScreenContainer } from '@/components/screen-container';
import { ScreenHeader } from '@/components/screen-header';
import { spacing } from '@/constants/layout';
import { ListDivider, PhotoListRow } from '@/features/my/components/photo-list-row';
import { useOpenedSpots, type MySpotItem } from '@/features/my/hooks/use-my-spots';
import { formatDayLabel } from '@/utils/format-date';

/** 서버는 최근에 연 순서로 주고, 날짜별 묶음은 앱이 만든다 */
function groupByDay(spots: MySpotItem[]) {
  const groups: { dateLabel: string; items: MySpotItem[] }[] = [];
  for (const spot of spots) {
    const dateLabel = formatDayLabel(spot.date);
    const last = groups.at(-1);
    if (last?.dateLabel === dateLabel) last.items.push(spot);
    else groups.push({ dateLabel, items: [spot] });
  }
  return groups;
}

/**
 * ③ 마이 탭: 연 자리 기록. 순위·공개 경쟁 없이 날짜별로 내가 연 자리만 모아 둔다.
 * 리스트 ↔ 지도 전환 버튼은 디자이너 요청으로 뺐다 (지도 보기는 Figma에서 보류).
 */
export function OpenedHistoryScreen() {
  const groups = groupByDay(useOpenedSpots() ?? []);

  return (
    <ScreenContainer
      contentTopGap={spacing.xs}
      header={<ScreenHeader title="연 자리 기록" />}>
      <View style={styles.groups}>
        {groups.map((group) => (
          <View key={group.dateLabel} style={styles.group}>
            <AppText variant="caption02" color="textTertiary">
              {group.dateLabel}
            </AppText>
            <View>
              {group.items.map((item, index) => (
                <Fragment key={item.postId}>
                  {index > 0 && <ListDivider />}
                  <PhotoListRow item={item} onPress={() => router.push({ pathname: '/my/spot/[id]', params: { id: item.postId } })} />
                </Fragment>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  groups: {
    gap: spacing.xl,
  },
  group: {
    gap: spacing.xxs,
  },
});
