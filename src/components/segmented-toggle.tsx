import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View, type LayoutRectangle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { AppText } from '@/components/app-text';
import { colors } from '@/constants/colors';
import { radius, spacing, toggleShadow } from '@/constants/layout';
import { duration, easeOut } from '@/constants/motion';

type SegmentedToggleProps<T extends string> = {
  options: readonly T[];
  selected: T;
  onSelect: (option: T) => void;
};

/**
 * 리스트 / 지도처럼 보기 방식을 바꾸는 작은 토글 (Figma toggle_element).
 * 고른 칸 뒤의 흰 칸이 100ms 동안 옆 칸으로 미끄러진다 (Figma 프로토타입 toggle_element: 스마트 애니메이트 100ms, Ease out).
 * 칸마다 글자 길이가 달라서, 그려진 뒤 칸의 위치와 너비를 재서 흰 칸을 옮긴다.
 */
export function SegmentedToggle<T extends string>({ options, selected, onSelect }: SegmentedToggleProps<T>) {
  const [layouts, setLayouts] = useState<Partial<Record<T, LayoutRectangle>>>({});
  const pillX = useSharedValue(0);
  const pillWidth = useSharedValue(0);
  const selectedLayout = layouts[selected];
  // 처음 잰 자리에는 움직이지 않고 바로 놓는다. 그 뒤부터 고를 때마다 미끄러진다
  const hasPlaced = useRef(false);

  useEffect(() => {
    if (!selectedLayout) return;
    const config = { duration: hasPlaced.current ? duration.press : 0, easing: easeOut };
    pillX.set(withTiming(selectedLayout.x, config));
    pillWidth.set(withTiming(selectedLayout.width, config));
    hasPlaced.current = true;
  }, [selectedLayout, pillX, pillWidth]);

  const pillStyle = useAnimatedStyle(() => ({
    width: pillWidth.get(),
    transform: [{ translateX: pillX.get() }],
  }));

  return (
    <View style={styles.container}>
      {/* 칸을 재기 전에는 너비가 0이라 보이지 않는다 */}
      <Animated.View style={[styles.pill, pillStyle]} />
      {options.map((option) => {
        const isSelected = option === selected;
        return (
          <Pressable
            key={option}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(option)}
            onLayout={(event) => {
              const layout = event.nativeEvent.layout;
              setLayouts((previous) => ({ ...previous, [option]: layout }));
            }}
            style={styles.option}>
            <AppText variant={isSelected ? 'button03' : 'button04'} color={isSelected ? 'textPrimary' : 'textSecondary'}>
              {option}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: spacing.xxs,
    gap: spacing.xxs,
    borderRadius: radius.md,
    backgroundColor: colors.disabledBackground,
  },
  option: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  // 흰 칸은 칸들 뒤에 깔린다. 위치는 칸의 x로 옮기므로 왼쪽 위 기준으로 둔다
  pill: {
    ...toggleShadow,
    position: 'absolute',
    top: spacing.xxs,
    bottom: spacing.xxs,
    left: 0,
    borderRadius: radius.sm,
    backgroundColor: colors.background01,
  },
});
