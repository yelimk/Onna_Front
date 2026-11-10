import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';

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

/** 펼쳤을 때 패널 아래와 탭 바 사이 틈. 접으면 이 틈을 지나 탭 바 뒤로 내려간다. */
const floatGap = spacing.xs;
const sheetPaddingBottom = spacing.sm;

type ExploreSheetProps = {
  nearestPhoto: PhotoMarker | null;
  isExpanded: boolean;
  onExpandedChange: (isExpanded: boolean) => void;
};

/**
 * 탐색 모드의 아래 패널. Figma '가장 가까운 기록 표시 / 미표시' 두 상태다.
 * - 펼침: 탭 바 위에 뜬 카드에 가장 가까운 기록을 보여준다.
 * - 접음: Figma '미표시'처럼 카드가 탭 바 뒤로 내려가 손잡이만 보인다. 지도를 가리지 않는다.
 * 손잡이를 누르거나, 패널을 손가락으로 끌어 펼치고 접는다. 끄는 동안 기록 칸과 카드가 손가락을 따라 오르내린다.
 */
export function ExploreSheet({ nearestPhoto, isExpanded, onExpandedChange }: ExploreSheetProps) {
  // 기록 칸은 내용(사진 여부)에 따라 높이가 달라서 그려진 높이를 재서 펼칠 높이로 쓴다.
  const [recordHeight, setRecordHeight] = useState(0);
  const { panHandlers, contentStyle, openAmount } = useSheetDrag({ isExpanded, onExpandedChange, openHeight: recordHeight });

  // 0(접음) ~ 1(펼침). 기록 칸이 열린 만큼 카드도 탭 바 뒤에서 올라와 뜬다.
  const openRatio = useDerivedValue(() => {
    if (recordHeight > 0) return openAmount.get() / recordHeight;
    return isExpanded ? 1 : 0;
  });
  // 접으면 아래 여백만큼 탭 바 뒤로 내려가 손잡이만 남고, 펼치면 탭 바 위로 floatGap만큼 뜬다.
  const sinkStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetPaddingBottom - openRatio.get() * (sheetPaddingBottom + floatGap) }],
  }));

  return (
    <Animated.View entering={sheetEntering} exiting={sheetExiting} {...panHandlers}>
      <Animated.View style={[styles.sheet, sinkStyle]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isExpanded ? '가장 가까운 기록 접기' : '가장 가까운 기록 펼치기'}
          hitSlop={spacing.sm}
          onPress={() => onExpandedChange(!isExpanded)}
          style={styles.handleArea}>
          <SheetHandle />
        </Pressable>
        <Animated.View style={[styles.recordArea, contentStyle]}>
          {/* 바깥 칸 높이가 0(접음)이어도 기록 칸은 제 높이로 재야 해서 위에 띄워 놓는다.
              칸 안에 그냥 두면 높이가 0으로 재져서 펼칠 높이도 0이 되고, 패널만 오르내리고 기록이 안 보였다. */}
          <View
            style={styles.recordContent}
            onLayout={({ nativeEvent }) => setRecordHeight(Math.round(nativeEvent.layout.height))}>
            <NearestRecord photo={nearestPhoto} />
          </View>
        </Animated.View>
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
    paddingBottom: sheetPaddingBottom,
    borderRadius: radius.lg,
    backgroundColor: colors.background01,
  },
  recordArea: {
    overflow: 'hidden',
  },
  recordContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
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
