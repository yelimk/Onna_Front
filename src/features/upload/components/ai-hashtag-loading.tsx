import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { AppText } from '@/components/app-text';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/layout';
import { duration } from '@/constants/motion';

const starIcon = require('@/assets/icons/ai-star.svg');
// Figma 'Rectangle 75'(30x46, -16도, 흐림 20)를 흐림까지 그린 그림. 앱은 흐림을 움직일 수 없어서 미리 그려 둔다
const shineImage = require('@/assets/images/upload/ai-hashtag-shine.png');

// Figma 해시태그 생성 중 상자 높이와 별 크기
const boxHeight = 40;
const starSize = 16;
const shineWidth = 76;
const shineHeight = 87;
// Figma 프로토타입: 0.3초 쉬고, 빛이 0.3초 동안 일정한 속도(Linear)로 왼쪽 밖에서 오른쪽 밖까지 지나간 뒤 바로 처음 자리로
const shineRestMs = duration.screen;
const shineSweepMs = duration.screen;

/**
 * AI가 해시태그를 만드는 동안 보이는 상자 (Figma 기록 탭 '한 줄 남기기' 해시태그 생성 중).
 * 연한 주황 상자 위로 흰 빛이 왼쪽에서 오른쪽으로 계속 지나가서, 기다리는 중이라는 걸 알려준다.
 */
export function AiHashtagLoading() {
  const [boxWidth, setBoxWidth] = useState(0);
  const shineX = useSharedValue(-shineWidth);

  useEffect(() => {
    if (boxWidth === 0) return;
    shineX.set(-shineWidth);
    shineX.set(
      withRepeat(
        withSequence(
          withDelay(shineRestMs, withTiming(boxWidth, { duration: shineSweepMs, easing: Easing.linear })),
          withTiming(-shineWidth, { duration: 0 }),
        ),
        -1,
      ),
    );
    return () => cancelAnimation(shineX);
  }, [boxWidth, shineX]);

  const shineStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shineX.get() }] }));

  return (
    <View
      accessibilityLabel="AI가 해시태그를 생성하고 있어요"
      style={styles.box}
      onLayout={(event) => setBoxWidth(event.nativeEvent.layout.width)}>
      <Animated.View pointerEvents="none" style={[styles.shine, shineStyle]}>
        <Image source={shineImage} style={styles.shineImage} />
      </Animated.View>
      <View style={styles.label}>
        <Image source={starIcon} style={styles.star} />
        <AppText variant="caption02" color="primary">
          AI가 해시태그를 생성하고 있어요
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    height: boxHeight,
    borderRadius: radius.md,
    backgroundColor: colors.selectedBackground,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  // 빛은 상자 세로 가운데에 두고 가로로만 움직인다
  shine: {
    position: 'absolute',
    left: 0,
    top: (boxHeight - shineHeight) / 2,
  },
  shineImage: {
    width: shineWidth,
    height: shineHeight,
  },
  label: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  star: {
    width: starSize,
    height: starSize,
  },
});
