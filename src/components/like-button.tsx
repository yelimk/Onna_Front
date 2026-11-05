import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle } from 'react-native-reanimated';

import { AnimatedAppText } from '@/components/app-text';
import { Icon } from '@/components/icon';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/layout';
import { duration } from '@/constants/motion';
import { useTransitionProgress } from '@/hooks/use-transition-progress';

type LikeButtonProps = {
  liked: boolean;
  onPress: () => void;
};

/**
 * 사진 상세 아래 '좋아요' 버튼 (Figma like). 누르면 빨간 하트와 빨간 테두리, 아니면 회색.
 * 지도 사진 카드와 마이 탭 좋아요 내역 상세가 같이 써서 src/components에 둔다.
 * 누르면 180ms 동안 서서히 빨갛게(또는 회색으로) 바뀐다 (Figma 프로토타입 like: 스마트 애니메이트 180ms, Ease out).
 */
export function LikeButton({ liked, onPress }: LikeButtonProps) {
  const progress = useTransitionProgress(liked, duration.change);
  const buttonStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(progress.get(), [0, 1], [colors.borderDeactivated, colors.likedBorder]),
  }));
  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.get(), [0, 1], [colors.textDeactivated, colors.error]),
  }));
  const filledHeartStyle = useAnimatedStyle(() => ({ opacity: progress.get() }));

  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: liked }} onPress={onPress}>
      <Animated.View style={[styles.button, buttonStyle]}>
        {/* 빈 하트 위에 빨간 하트를 겹쳐 두고 투명도만 바꾼다. 아이콘은 그림이라 색을 직접 섞을 수 없어서다 */}
        <View>
          <Icon name="heart" />
          <Animated.View style={[StyleSheet.absoluteFill, filledHeartStyle]}>
            <Icon name="heartFilled" />
          </Animated.View>
        </View>
        <AnimatedAppText variant="button03" style={labelStyle}>
          좋아요
        </AnimatedAppText>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    backgroundColor: colors.background01,
  },
});
