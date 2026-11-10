import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Chip } from '@/components/chip';
import { spacing } from '@/constants/layout';
import { AiHashtagLoading } from '@/features/upload/components/ai-hashtag-loading';
import { formatHashtag } from '@/utils/format-hashtag';

export const maxHashtagCount = 3;

type AiHashtagPickerProps = {
  /** AI가 만든 해시태그 이름 (# 없음) */
  suggestions: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  /** AI가 해시태그를 만드는 중이면 후보 대신 '생성하고 있어요' 상자를 보여준다 */
  isLoading?: boolean;
};

/**
 * AI가 한 줄을 읽고 고른 해시태그 중 최대 3개를 고른다.
 * 직접 쓰지 않고 AI 추천 안에서만 고르게 해서 한 줄과 상관없는 해시태그가 붙는 것을 막는다.
 * AI 응답을 기다리는 동안은 제목 아래에 '생성하고 있어요' 상자를 보여준다 (Figma 해시태그 생성 중).
 */
export function AiHashtagPicker({ suggestions, selected, onChange, isLoading = false }: AiHashtagPickerProps) {
  const isSelected = (tag: string) => selected.includes(tag);

  const toggle = (tag: string) => {
    if (isSelected(tag)) {
      onChange(selected.filter((item) => item !== tag));
      return;
    }
    if (selected.length < maxHashtagCount) {
      onChange([...selected, tag]);
    }
  };

  return (
    <View style={[styles.container, isLoading && styles.loadingContainer]}>
      <View style={styles.titleRow}>
        <AppText variant="subtitle03">한 줄을 읽고 고른 해시태그</AppText>
        <AppText variant="caption03" color="textDeactivated">
          최대 {maxHashtagCount}개 선택
        </AppText>
      </View>
      {isLoading ? (
        <AiHashtagLoading />
      ) : (
        <View style={styles.chips}>
          {suggestions.map((tag) => (
            <Chip key={tag} label={formatHashtag(tag)} selected={isSelected(tag)} onPress={() => toggle(tag)} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  // Figma 해시태그 생성 중: 제목과 상자 사이 8
  loadingContainer: {
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
});
