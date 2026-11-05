import { Pressable, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import { AppText } from '@/components/app-text';
import { Icon } from '@/components/icon';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/layout';
import { usePopStyle } from '@/hooks/use-pop-style';

type LikeButtonProps = {
  liked: boolean;
  onPress: () => void;
};

/**
 * 사진 상세 아래 '좋아요' 버튼 (Figma like). 누르면 빨간 하트와 빨간 테두리, 아니면 회색.
 * 지도 사진 카드와 마이 탭 좋아요 내역 상세가 같이 써서 src/components에 둔다.
 * 좋아요를 누르는 순간 하트가 톡 튄다 (Figma 애니메이션: 좋아요 버튼 상호작용).
 */
export function LikeButton({ liked, onPress }: LikeButtonProps) {
  const heartStyle = usePopStyle(liked);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: liked }}
      onPress={onPress}
      style={[styles.button, liked && styles.liked]}>
      <Animated.View style={heartStyle}>
        <Icon name={liked ? 'heartFilled' : 'heart'} />
      </Animated.View>
      <AppText variant="button03" color={liked ? 'error' : 'textDeactivated'}>
        좋아요
      </AppText>
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
    borderColor: colors.borderDeactivated,
    backgroundColor: colors.background01,
  },
  liked: {
    borderColor: colors.likedBorder,
  },
});
