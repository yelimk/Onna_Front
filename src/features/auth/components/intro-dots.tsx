import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/layout';
import { duration, easeInOut } from '@/constants/motion';

// Figma 온보딩: 지금 장은 24 너비 주황 막대, 나머지는 8 회색 점
const dotSize = 8;
const activeDotWidth = 24;

type IntroDotsProps = {
  count: number;
  activeIndex: number;
};

/** 소개 화면 아래 진행 점. '다음'을 누르면 주황 막대가 다음 점으로 늘어나며 옮겨 간다 (Figma 애니메이션: 진행 아이콘 변환) */
export function IntroDots({ count, activeIndex }: IntroDotsProps) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: count }, (_, index) => (
        <Dot key={index} isActive={index === activeIndex} />
      ))}
    </View>
  );
}

function Dot({ isActive }: { isActive: boolean }) {
  // 처음 그릴 때는 움직이지 않고 그 상태로 시작한다
  const progress = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    progress.set(withTiming(isActive ? 1 : 0, { duration: duration.screen, easing: easeInOut }));
  }, [isActive, progress]);

  const dotStyle = useAnimatedStyle(() => ({
    width: dotSize + (activeDotWidth - dotSize) * progress.get(),
    backgroundColor: interpolateColor(progress.get(), [0, 1], [colors.placeholderBox, colors.primary]),
  }));

  return <Animated.View style={[styles.dot, dotStyle]} />;
}

const styles = StyleSheet.create({
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  dot: {
    height: dotSize,
    borderRadius: radius.full,
  },
});
