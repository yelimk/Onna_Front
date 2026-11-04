import { StyleSheet, View, type ViewStyle } from 'react-native';

import { AppText } from '@/components/app-text';
import { Icon } from '@/components/icon';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/layout';

type AiBadgeProps = {
  label: string;
  style?: ViewStyle;
};

/** 'AI 추천순', 'AI 추천 경로'처럼 AI가 정한 것임을 알리는 연한 주황 배지. 글자 앞에 반짝이를 둔다 (Figma 지도 애니메이션). */
export function AiBadge({ label, style }: AiBadgeProps) {
  return (
    <View style={[styles.badge, style]}>
      <Icon name="sparkle" size={16} />
      <AppText variant="caption03" color="primary">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.selectedBackground,
  },
});
