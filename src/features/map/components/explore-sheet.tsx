import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';

import { AppText } from '@/components/app-text';
import { Icon } from '@/components/icon';
import { colors } from '@/constants/colors';
import { floatingShadow, radius, spacing } from '@/constants/layout';
import { duration } from '@/constants/motion';
import { RecordPhoto } from '@/features/map/components/record-photo';
import { SheetHandle } from '@/features/map/components/sheet-handle';
import { useSheetDrag } from '@/features/map/hooks/use-sheet-drag';
import type { PhotoMarker } from '@/features/map/types/home-map-marker';
import { openRecord } from '@/features/map/utils/open-search-result';

// 탐색 모드를 켜고 끌 때 패널이 아래에서 올라오고 내려간다 (다른 아래 패널과 같은 길이, SlidingPanel 참고).
const sheetEntering = SlideInDown.duration(duration.normal);
const sheetExiting = SlideOutDown.duration(duration.fast);

type ExploreSheetProps = {
  nearestPhoto: PhotoMarker | null;
  isExpanded: boolean;
  onExpandedChange: (isExpanded: boolean) => void;
};

/**
 * 탐색 모드의 아래 패널. Figma '가장 가까운 기록 표시 / 미표시' 두 상태다.
 * 손잡이를 누르거나, 패널을 손가락으로 끌어 펼치고 접는다. 끄는 동안 기록 칸이 손가락을 따라 드러난다.
 */
export function ExploreSheet({ nearestPhoto, isExpanded, onExpandedChange }: ExploreSheetProps) {
  // 기록 칸은 내용(사진 여부)에 따라 높이가 달라서 그려진 높이를 재서 펼칠 높이로 쓴다.
  const [recordHeight, setRecordHeight] = useState(0);
  const { panHandlers, contentStyle } = useSheetDrag({ isExpanded, onExpandedChange, openHeight: recordHeight });

  return (
    <Animated.View entering={sheetEntering} exiting={sheetExiting} style={styles.sheet} {...panHandlers}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isExpanded ? '가장 가까운 기록 접기' : '가장 가까운 기록 펼치기'}
        hitSlop={spacing.sm}
        onPress={() => onExpandedChange(!isExpanded)}
        style={styles.handleArea}>
        <SheetHandle />
      </Pressable>
      <Animated.View style={[styles.recordArea, contentStyle]}>
        <View onLayout={({ nativeEvent }) => setRecordHeight(Math.round(nativeEvent.layout.height))}>
          <NearestRecord photo={nearestPhoto} />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

function NearestRecord({ photo }: { photo: PhotoMarker | null }) {
  if (!photo) {
    return (
      <AppText variant="caption01" color="textTertiary" style={styles.empty}>
        근처에 남겨진 기록이 아직 없어요
      </AppText>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`가장 가까운 기록 ${photo.hashtags.join(' ')}`}
      onPress={() => openRecord(photo.id)}
      style={styles.record}>
      <RecordPhoto imageUrl={photo.imageUrl} width={60} height={60} />
      <View style={styles.texts}>
        <AppText variant="caption01" color="textTertiary">
          가장 가까운 기록
        </AppText>
        <View style={styles.hashtags}>
          {photo.hashtags.map((hashtag) => (
            <AppText key={hashtag} variant="button03">
              {hashtag}
            </AppText>
          ))}
        </View>
      </View>
      <Icon name="forward" size={24} color="textDeactivated" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sheet: {
    ...floatingShadow,
    paddingBottom: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.background01,
  },
  recordArea: {
    overflow: 'hidden',
  },
  handleArea: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  record: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xxs,
  },
  texts: {
    flex: 1,
    gap: spacing.xxs,
  },
  hashtags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  empty: {
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
});
