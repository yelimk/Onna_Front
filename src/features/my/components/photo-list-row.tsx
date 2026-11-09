import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle } from 'react-native-reanimated';

import { AppText } from '@/components/app-text';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/layout';
import { duration } from '@/constants/motion';
import type { MySpotItem } from '@/features/my/hooks/use-my-spots';
import { usePressProgress } from '@/hooks/use-press-progress';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Figma list_l, list_m: 사진 64
const photoSize = 64;

type PhotoListRowProps = {
  item: MySpotItem;
  onPress: () => void;
  /** 오른쪽 위 (예: 좋아요 하트) */
  right?: ReactNode;
};

/**
 * Figma list_l, list_m. 좋아요 내역·연 자리 기록에서 쓰는 사진 한 줄. list_m은 오른쪽에 하트가 붙는다(right).
 * 누르고 있으면 줄 배경만 80ms 동안 회색으로 바뀐다 (Figma 프로토타입 list_m pressed: 80ms).
 * 사진·글자가 작아지는 움직임은 디자이너 요청으로 뺐다 (내 기록과 같다).
 */
export function PhotoListRow({ item, onPress, right }: PhotoListRowProps) {
  const { progress, pressHandlers } = usePressProgress(duration.listPress);
  const rowStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.get(), [0, 1], [colors.background01, colors.background02]),
  }));

  return (
    <AnimatedPressable accessibilityRole="button" onPress={onPress} style={[styles.row, rowStyle]} {...pressHandlers}>
      <View style={styles.photo}>
        <Image source={item.photo} style={styles.photoImage} contentFit="cover" />
      </View>
      <View style={styles.textsAndRight}>
        <View style={styles.texts}>
          <AppText variant="subtitle03" numberOfLines={1}>
            {item.title}
          </AppText>
          <AppText variant="caption02" color="textTertiary" numberOfLines={1}>
            {item.hashtags.join(' ')}
          </AppText>
        </View>
        {right}
      </View>
    </AnimatedPressable>
  );
}

/** 목록 줄 사이 구분선 */
export function ListDivider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  // 사진(64)과 위아래 여백(12)으로 정해지는 줄 높이. 누른 동안 이 줄 전체가 회색 칸이 된다.
  row: {
    height: photoSize + spacing.sm * 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.md,
    // 회색 칸이 사진에 붙지 않게 안쪽 여백 8을 두고, 같은 만큼 바깥으로 넓혀 사진·글 자리는 그대로 둔다
    marginHorizontal: -spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  photo: {
    width: photoSize,
    height: photoSize,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  photoImage: {
    flex: 1,
  },
  // Figma list_m: 사진과 글 사이는 16이지만, 글과 오른쪽 하트 사이는 4라서 둘을 한 묶음으로 둔다
  textsAndRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  // Figma list_l·list_m: 글 묶음 위아래 4
  texts: {
    flex: 1,
    gap: spacing.xxs,
    paddingVertical: spacing.xxs,
  },
  // Figma 좋아요 내역·연 자리 기록: 줄 사이 선 0.5, Gray/300
  divider: {
    height: 0.5,
    backgroundColor: colors.borderDeactivated,
  },
});
