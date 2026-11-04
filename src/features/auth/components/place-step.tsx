import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { spacing } from '@/constants/layout';
import { OptionCard } from '@/features/auth/components/option-card';
import { StepTitle } from '@/features/auth/components/step-title';
import { minPlaceCount, placeDescriptions } from '@/features/auth/constants/survey-options';
import type { Tag } from '@/types/api';
import { formatHashtag } from '@/utils/format-hashtag';

type PlaceStepProps = {
  /** 서버 해시태그 사전. null이면 불러오는 중 */
  tags: Tag[] | null;
  value: number[];
  onChange: (value: number[]) => void;
};

/** 설문 2/3: 끌리는 자리 해시태그 (여러 개, 최소 3개). 고른 태그 id를 서버에 저장한다. */
export function PlaceStep({ tags, value, onChange }: PlaceStepProps) {
  const toggle = (tagId: number) =>
    onChange(value.includes(tagId) ? value.filter((item) => item !== tagId) : [...value, tagId]);

  return (
    <View>
      <StepTitle
        title={'어떤 자리에\n마음이 가나요?'}
        description={
          <>
            {minPlaceCount}개 이상 골라주세요 ·{' '}
            <AppText variant="button01">{value.length}개</AppText> 선택
          </>
        }
      />


      <View style={styles.grid}>
        {tags?.map((tag) => {
          const hashtag = formatHashtag(tag.name);
          return (
            <OptionCard
              key={tag.id}
              title={hashtag}
              description={placeDescriptions[hashtag]}
              selected={value.includes(tag.id)}
              onPress={() => toggle(tag.id)}
              compact
              style={styles.gridItem}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  // 칸 사이 간격 때문에 50%는 한 줄에 두 개가 안 들어간다.
  // 세 개는 못 들어가는 40%를 기본 폭으로 잡고 남는 폭은 flexGrow로 나눠 채워서 늘 두 칸이 된다.
  gridItem: {
    flexBasis: '40%',
    flexGrow: 1,
  },
});
