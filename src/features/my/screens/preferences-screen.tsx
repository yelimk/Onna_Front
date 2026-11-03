import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { saveMyTags } from '@/api/users';
import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { ScreenContainer } from '@/components/screen-container';
import { ScreenHeader } from '@/components/screen-header';
import { sectionGap, spacing } from '@/constants/layout';
import { useTags } from '@/hooks/use-tags';
import { formatHashtag } from '@/utils/format-hashtag';
import { showApiError } from '@/utils/show-api-error';

/**
 * ③ 마이 탭: 사용자 기호 설정. 온보딩 설문에서 고른 취향을 다시 고친다.
 * 서버 태그 목록에서 고르고 '저장하기'로 통째로 바꿔 저장한다.
 * 내가 전에 고른 태그를 받는 API가 아직 없어서, 처음에는 아무것도 고르지 않은 상태로 시작한다.
 */
export function PreferencesScreen() {
  const { tags, hasFailed, reload } = useTags();
  const [selected, setSelected] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const toggle = (tagId: number) =>
    setSelected(selected.includes(tagId) ? selected.filter((item) => item !== tagId) : [...selected, tagId]);

  const save = async () => {
    setIsSaving(true);
    try {
      await saveMyTags(selected);
      router.back();
    } catch (error) {
      showApiError(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenContainer
      contentTopGap={spacing.xs}
      header={<ScreenHeader title="사용자 기호 설정" />}
      footer={
        <Button
          label={isSaving ? '저장하는 중…' : '저장하기'}
          variant="primary"
          // 서버는 빈 목록을 받지 않아서 하나 이상 골라야 저장할 수 있다
          disabled={selected.length === 0 || isSaving}
          onPress={save}
        />
      }>
      <AppText variant="subtitle02">어떤 자리에 끌리나요?</AppText>
      <AppText variant="body01" color="textSecondary">
        고른 해시태그로 AI가 추천해줘요
      </AppText>

      <View style={styles.group}>
        {hasFailed && (
          <Pressable onPress={reload} hitSlop={8}>
            <AppText variant="caption02" color="textTertiary">
              해시태그를 불러오지 못했어요. 눌러서 다시 불러오기
            </AppText>
          </Pressable>
        )}
        <View style={styles.chips}>
          {tags?.map((tag) => (
            <Chip
              key={tag.id}
              label={formatHashtag(tag.name)}
              selected={selected.includes(tag.id)}
              onPress={() => toggle(tag.id)}
            />
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
}

// Figma 사용자 기호 설정: 해시태그 칩 사이 11 (디자인 시스템 간격 8·12 사이 값이라 이 화면에만 쓴다)
const chipGap = 11;

const styles = StyleSheet.create({
  group: {
    marginTop: sectionGap,
    gap: spacing.xs,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: chipGap,
  },
});
