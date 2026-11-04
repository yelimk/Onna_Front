import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/layout';
import type { TypographyVariant } from '@/constants/typography';
import type { MySpotItem } from '@/features/my/hooks/use-my-spots';

type PhotoListRowProps = {
  item: MySpotItem;
  onPress: () => void;
  /** 오른쪽 위 (예: 좋아요 하트) */
  right?: ReactNode;
};

// 누르고 있으면 사진과 글자가 한 단계씩 작아진다 (Figma list_l, list_m default → pressed)
const sizes = {
  default: { photo: 64, title: 'subtitle03', caption: 'caption02' },
  pressed: { photo: 60, title: 'listTitlePressed', caption: 'listCaptionPressed' },
} satisfies Record<string, { photo: number; title: TypographyVariant; caption: TypographyVariant }>;

/** Figma list_l, list_m. 좋아요 내역·연 자리 기록에서 쓰는 사진 한 줄. list_m은 오른쪽에 하트가 붙는다(right). */
export function PhotoListRow({ item, onPress, right }: PhotoListRowProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.row}>
      {({ pressed }) => {
        const size = sizes[pressed ? 'pressed' : 'default'];
        return (
          <View style={[styles.content, pressed && styles.pressedContent]}>
            <Image
              source={item.photo}
              style={[styles.photo, { width: size.photo, height: size.photo }]}
              contentFit="cover"
            />
            <View style={styles.texts}>
              <AppText variant={size.title} numberOfLines={1}>
                {item.title}
              </AppText>
              <AppText variant={size.caption} color="textTertiary" numberOfLines={1}>
                {item.hashtags.join(' ')}
              </AppText>
            </View>
            {right}
          </View>
        );
      }}
    </Pressable>
  );
}

/** 목록 줄 사이 구분선 */
export function ListDivider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  // 기본 사진(64)과 위아래 여백(12)으로 정해지는 줄 높이. 눌러서 사진이 작아져도 이 높이를 지킨다.
  row: {
    height: 64 + spacing.sm * 2,
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  // Figma pressed: 줄 양옆을 4씩 줄인 회색 칸, 안쪽 여백 8
  pressedContent: {
    marginHorizontal: spacing.xxs,
    padding: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.background02,
  },
  photo: {
    borderRadius: radius.sm,
  },
  // Figma list_l·list_m: 글 묶음 위아래 4
  texts: {
    flex: 1,
    gap: spacing.xxs,
    paddingVertical: spacing.xxs,
  },
  // Figma 좋아요 내역·연 자리 기록: 줄 사이 선 0.5, Gray/300
  divider: {
    height: 0.5,
    backgroundColor: colors.borderDeactivated,
  },
});
