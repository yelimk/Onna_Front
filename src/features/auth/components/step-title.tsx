import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { sectionGap, spacing } from '@/constants/layout';

type StepTitleProps = {
  title: string;
  description?: ReactNode;
  /** 제목 아래 내용까지 간격. Figma 설문은 40, 회원가입은 24 */
  gapBelow?: number;
};

/** 설문·회원가입 단계마다 맨 위에 두는 큰 제목과 한 줄 설명 */
export function StepTitle({ title, description, gapBelow = sectionGap }: StepTitleProps) {
  return (
    <View style={[styles.container, { marginBottom: gapBelow }]}>
      <AppText variant="heading02">{title}</AppText>
      {description && (
        <AppText variant="body01" color="textTertiary">
          {description}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xxs,
  },
});
