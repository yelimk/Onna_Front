import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { getMyTags, saveMyTags } from '@/api/users';
import { Button } from '@/components/button';
import { ScreenContainer } from '@/components/screen-container';
import { ScreenHeader } from '@/components/screen-header';
import { showToast } from '@/components/toast';
import { spacing } from '@/constants/layout';
import { minPreferredTagCount } from '@/constants/preferred-tags';
import { walkDurationOptions, walkTimeOptions, type WalkDuration, type WalkTime } from '@/constants/walk-options';
import { ChipGroup, PreferenceCard } from '@/features/my/components/preference-card';
import { useTags } from '@/hooks/use-tags';
import { formatHashtag } from '@/utils/format-hashtag';
import { showApiError } from '@/utils/show-api-error';

/**
 * ③ 마이 탭: 사용자 기호 설정 (Figma 새 버전: 해시태그 유형 카드 + 걸음 유형 카드).
 * 해시태그는 서버 태그 목록에서 고르고 '저장하기'로 통째로 바꿔 저장한다.
 * 들어오면 전에 고른 해시태그를 서버에서 받아 미리 골라 둔다.
 * 걷는 방식·시간은 서버에 저장할 곳이 아직 없어서 화면 안에서만 고른다 (백엔드에 요청해 둠).
 */
export function PreferencesScreen() {
  const { tags } = useTags();
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  useEffect(() => {
    getMyTags()
      .then((myTags) => setSelectedTagIds(myTags.map((tag) => tag.id)))
      .catch(showApiError);
  }, []);
  const [walkTimes, setWalkTimes] = useState<WalkTime[]>([]);
  const [walkDuration, setWalkDuration] = useState<WalkDuration>();
  const [isSaving, setIsSaving] = useState(false);

  const toggleTag = (tagId: number) =>
    setSelectedTagIds((ids) => (ids.includes(tagId) ? ids.filter((id) => id !== tagId) : [...ids, tagId]));
  const toggleWalkTime = (time: WalkTime) =>
    setWalkTimes((times) => (times.includes(time) ? times.filter((item) => item !== time) : [...times, time]));

  const save = async () => {
    // 저장하는 동안 버튼 모양은 그대로 두고, 두 번 눌러도 한 번만 보낸다
    if (isSaving) return;
    // 서버는 3개보다 적으면 받지 않는다. 버튼은 Figma처럼 늘 주황으로 두고, 모자라면 저장하지 않고 알려준다.
    if (selectedTagIds.length < minPreferredTagCount) {
      showToast(`해시태그를 ${minPreferredTagCount}개 이상 선택해 주세요`, 'error');
      return;
    }
    setIsSaving(true);
    try {
      await saveMyTags(selectedTagIds);
      router.back();
    } catch (error) {
      showApiError(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenContainer
      background="gray"
      contentTopGap={spacing.xs}
      header={<ScreenHeader title="사용자 기호 설정" />}
      footer={<Button label="저장하기" variant="primary" onPress={save} />}>
      <View style={styles.cards}>
        <PreferenceCard title="해시태그 유형" description="마음이 가는 해시태그를 모두 선택해 주세요">
          <ChipGroup
            options={(tags ?? []).map((tag) => ({ key: tag.id, label: formatHashtag(tag.name) }))}
            isSelected={(tagId) => selectedTagIds.includes(tagId)}
            onToggle={toggleTag}
          />
        </PreferenceCard>

        <PreferenceCard title="걸음 유형" gapBelowTitle={spacing.sm}>
          <View style={styles.walkGroups}>
            <ChipGroup
              label="걷는 방식"
              options={walkTimeOptions.map((time) => ({ key: time, label: time }))}
              isSelected={(time) => walkTimes.includes(time)}
              onToggle={toggleWalkTime}
            />
            <ChipGroup
              label="한번에 걷는 시간"
              options={walkDurationOptions.map((duration) => ({ key: duration, label: duration }))}
              isSelected={(duration) => walkDuration === duration}
              onToggle={setWalkDuration}
            />
          </View>
        </PreferenceCard>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  // Figma: 카드끼리 20
  cards: {
    gap: spacing.lg,
  },
  // Figma 걸음 유형: 묶음끼리 24
  walkGroups: {
    gap: spacing.xl,
  },
});
