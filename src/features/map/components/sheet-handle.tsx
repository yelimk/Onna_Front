import { StyleSheet, View } from 'react-native';

import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/layout';

/** Figma 손잡이 너비 */
const handleWidth = 44;

/** 아래 패널·카드 맨 위의 회색 손잡이 막대 (Figma 44×4) */
export function SheetHandle() {
  return <View style={styles.handle} />;
}

const styles = StyleSheet.create({
  handle: {
    alignSelf: 'center',
    width: handleWidth,
    height: spacing.xxs,
    borderRadius: radius.full,
    backgroundColor: colors.borderDeactivated,
  },
});
