import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Icon, type IconName } from '@/components/icon';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/layout';

export type ActivityMenuItem = {
  icon: IconName;
  label: string;
  onPress: () => void;
};

// Figma '내 활동' 카드 모서리 20 (디자인 시스템 모서리 12·16·24 사이 값이라 이 카드에만 쓴다)
const cardRadius = 20;

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
          <Pressable key={item.label} accessibilityRole="button" onPress={item.onPress} style={styles.rowWrapper}>
            {({ pressed }) => (
              <View style={[styles.row, pressed && styles.pressedRow]}>
                <View style={styles.label}>
                  <Icon name={item.icon} />
                  <AppText variant="caption02">{item.label}</AppText>
                </View>
                <Icon name="forwardSmall" />
              </View>
            )}
          </Pressable>
        ))}
      </View>
    </View>
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
    paddingLeft: spacing.xs,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  // 누르고 있으면 줄에 옅은 회색이 깔린다 (Figma 마이탭 컴포넌트 list pressed)
  pressedRow: {
    backgroundColor: colors.background02,
  },
  label: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
