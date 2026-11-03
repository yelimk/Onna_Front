import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { colors } from '@/constants/colors';
import { pressedListScale, radius, spacing } from '@/constants/layout';
import type { MySpotItem } from '@/mock/my-activity';

type PhotoListRowProps = {
  item: MySpotItem;
  onPress: () => void;
  /** 오른쪽 위 (예: 좋아요 하트) */
  right?: ReactNode;
};

/** Figma list_l, list_m. 좋아요 내역·연 자리 기록에서 쓰는 사진 한 줄. list_m은 오른쪽에 하트가 붙는다(right). */
export function PhotoListRow({ item, onPress, right }: PhotoListRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <Image source={item.photo} style={styles.photo} contentFit="cover" />
      <View style={styles.texts}>
        <AppText variant="subtitle03" numberOfLines={1}>
          {item.title}
        </AppText>
        <AppText variant="caption02" color="textTertiary" numberOfLines={1}>
          {item.hashtags.join(' ')}
        </AppText>
      </View>
      {right}
    </Pressable>
  );
}

/** 목록 줄 사이 구분선 */
export function ListDivider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  // 누르고 있으면 줄이 살짝 작아지고 회색 배경이 깔린다 (Figma list pressed)
  pressed: {
    backgroundColor: colors.background02,
    transform: [{ scale: pressedListScale }],
  },
  photo: {
    width: 64,
    height: 64,
    borderRadius: radius.sm,
  },
  texts: {
    flex: 1,
    gap: spacing.xxs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.disabledBackground,
  },
});
