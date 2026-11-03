import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/app-text';
import { Icon } from '@/components/icon';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/layout';

type LikeButtonProps = {
  liked: boolean;
  onPress: () => void;
};

/**
 * 사진 상세 아래 '좋아요' 버튼 (Figma like). 누르면 빨간 하트와 빨간 테두리, 아니면 회색.
 * 지도 사진 카드와 마이 탭 좋아요 내역 상세가 같이 써서 src/components에 둔다.
 */
export function LikeButton({ liked, onPress }: LikeButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: liked }}
      onPress={onPress}
      style={[styles.button, liked && styles.liked]}>
      <Icon name={liked ? 'heartFilled' : 'heart'} />
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
