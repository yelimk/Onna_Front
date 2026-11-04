import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Chip } from '@/components/chip';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/layout';

// Figma 사용자 기호 설정: 칩 사이 11 (디자인 시스템 간격 8·12 사이 값이라 이 화면 칩에만 쓴다)
const chipGap = 11;

type PreferenceCardProps = {
  title: string;
  description?: string;
  /** 제목 아래 내용까지 간격. Figma 해시태그 유형은 16, 걸음 유형은 12 */
  gapBelowTitle?: number;
  children: ReactNode;
};

/** 사용자 기호 설정의 흰 카드 하나 (Figma: 모서리 16, 안쪽 16, 제목 18) */
export function PreferenceCard({ title, description, gapBelowTitle = spacing.md, children }: PreferenceCardProps) {
  return (
    <View style={[styles.card, { gap: gapBelowTitle }]}>
      <View style={styles.heading}>
        <AppText variant="subtitle02">{title}</AppText>
        {description && (
          <AppText variant="body02" color="textSecondary">
            {description}
          </AppText>
        )}
      </View>
      {children}
    </View>
  );
}

type ChipOption<T> = { key: T; label: string };

type ChipGroupProps<T> = {
  /** 카드 안 작은 제목 (예: 걷는 방식) */
  label?: string;
  options: ChipOption<T>[];
  isSelected: (key: T) => boolean;
  onToggle: (key: T) => void;
};

/** 칩 여러 개를 줄바꿈하며 늘어놓는 묶음. 고른 칩은 검정 (Figma hashtag selected) */
export function ChipGroup<T extends string | number>({ label, options, isSelected, onToggle }: ChipGroupProps<T>) {
  return (
    <View style={styles.group}>
      {label && (
        <AppText variant="subtitle04" color="textTertiary">
          {label}
        </AppText>
      )}
      <View style={styles.chips}>
        {options.map((option) => (
          <Chip
            key={option.key}
            label={option.label}
            selected={isSelected(option.key)}
            onPress={() => onToggle(option.key)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.background01,
  },
  heading: {
    gap: spacing.xxs,
  },
  group: {
    gap: spacing.xs,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: chipGap,
  },
});
