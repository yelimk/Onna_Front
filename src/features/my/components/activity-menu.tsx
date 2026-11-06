import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { interpolate, interpolateColor, useAnimatedStyle } from 'react-native-reanimated';

import { AppText } from '@/components/app-text';
import { Icon, type IconName } from '@/components/icon';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/layout';
import { duration } from '@/constants/motion';
import { usePressProgress } from '@/hooks/use-press-progress';

export type ActivityMenuItem = {
  icon: IconName;
  label: string;
  onPress: () => void;
};

// Figma '내 활동' 카드 모서리 20 (디자인 시스템 모서리 12·16·24 사이 값이라 이 카드에만 쓴다)
const cardRadius = 20;
// Figma 메뉴 줄 pressed: 아이콘·글자가 오른쪽으로 4 밀리고(왼쪽 여백 8 → 12), 글자가 14 → 13으로 작아진다
const pressedPaddingLeft = spacing.sm;
const pressedLabelScale = 13 / 14;

type ActivityMenuProps = {
  title: string;
  items: ActivityMenuItem[];
};

/**
 * 마이 첫 화면의 '내 활동' 메뉴 카드 (Figma 마이 새 버전).
 * 설정 화면의 메뉴(MenuGroup)와 달리 제목이 카드 안에 있고, 줄 사이 선 없이 24 아이콘 + 보통 굵기 글자로 둔다.
 */
export function ActivityMenu({ title, items }: ActivityMenuProps) {
  return (
    <View style={styles.card}>
      <AppText variant="caption01" style={styles.title}>
        {title}
      </AppText>
      <View>
        {items.map((item) => (
          <ActivityRow key={item.label} item={item} />
        ))}
      </View>
    </View>
  );
}

/**
 * 메뉴 한 줄. 누르고 있으면 100ms 동안 옅은 회색이 깔리고, 아이콘·글자가 오른쪽으로 조금 밀리며 글자가 작아진다
 * (Figma 프로토타입 마이 메뉴 pressed: 스마트 애니메이트 100ms, Ease out).
 * 글자 크기는 부드럽게 바꿀 수 없어서 글자를 줄이는(scale) 것으로 대신한다.
 */
function ActivityRow({ item }: { item: ActivityMenuItem }) {
  const { progress, pressHandlers } = usePressProgress(duration.press);
  const rowStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.get(), [0, 1], [colors.background01, colors.background02]),
    paddingLeft: interpolate(progress.get(), [0, 1], [spacing.xs, pressedPaddingLeft]),
  }));
  const labelStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(progress.get(), [0, 1], [1, pressedLabelScale]) }],
  }));

  return (
    <Pressable accessibilityRole="button" onPress={item.onPress} style={styles.rowWrapper} {...pressHandlers}>
      <Animated.View style={[styles.row, rowStyle]}>
        <View style={styles.label}>
          <Icon name={item.icon} />
          <Animated.View style={[styles.labelText, labelStyle]}>
            <AppText variant="caption02">{item.label}</AppText>
          </Animated.View>
        </View>
        <Icon name="forwardSmall" />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Figma: 모서리 20, 위 16, 아래 8, 옆 8
  card: {
    gap: spacing.xs,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    paddingHorizontal: spacing.xs,
    borderRadius: cardRadius,
    backgroundColor: colors.background01,
  },
  title: {
    paddingHorizontal: spacing.xs,
  },
  rowWrapper: {
    paddingVertical: spacing.xxs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  label: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  // 작아질 때 왼쪽 끝을 기준으로 줄여서 아이콘과의 간격이 그대로다
  labelText: {
    transformOrigin: 'left center',
  },
});
