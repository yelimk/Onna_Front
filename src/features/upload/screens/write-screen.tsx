import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { ScreenContainer } from '@/components/screen-container';
import { TextField } from '@/components/text-field';
import { sectionGap, spacing } from '@/constants/layout';
import { AiHashtagPicker } from '@/features/upload/components/ai-hashtag-picker';
import { DraftPhoto } from '@/features/upload/components/draft-photo';
import { UploadStepHeader } from '@/features/upload/components/upload-step-header';
import { useHashtagSuggestions } from '@/features/upload/hooks/use-hashtag-suggestions';
import { useWriteQuestion } from '@/features/upload/hooks/use-write-question';
import { useUploadDraft } from '@/features/upload/upload-draft';

// 입력 부담을 줄이려고 제목은 짧게, 한 줄은 한 문장 길이까지만 받는다 (GUI 0/15, 22/40. 서버는 한 줄 100자까지 받는다)
const maxTitleLength = 15;
const maxOneLineLength = 40;

/**
 * ② 기록 탭: 남기기 2/3 한 줄 남기기.
 * 위쪽 질문은 서버가 무작위로 하나 골라 준다.
 * 해시태그는 한 줄 코멘트를 다 쓰고 입력칸을 벗어나면 AI에게 받아 와서 보여준다.
 */
export function WriteScreen() {
  const { draft, updateDraft } = useUploadDraft();
  const { question, questionId, hasFailed: questionFailed, reload: reloadQuestion } = useWriteQuestion();
  const { suggestions, hasFailed, requestSuggestions, clearSuggestions } = useHashtagSuggestions();

  // 한 줄을 고치면 그 한 줄로 고른 해시태그도 더는 맞지 않으니 함께 지운다
  const changeOneLine = (oneLine: string) => {
    updateDraft({ oneLine, hashtags: [] });
    clearSuggestions();
  };
  const canGoNext = draft.title.trim().length > 0 && draft.oneLine.trim().length > 0 && draft.hashtags.length > 0;

  return (
    <ScreenContainer
      header={<UploadStepHeader title="한 줄 남기기" step={2} />}
      footer={
        <Button label="다음" variant="primary" disabled={!canGoNext} onPress={() => router.push('/upload/confirm')} />
      }>
      <View style={styles.title}>
        <DraftPhoto uri={draft.photoUri} width={100} height={100} />
        {questionFailed ? (
          <Pressable onPress={reloadQuestion} hitSlop={8} style={styles.titleText}>
            <AppText variant="body01" color="textTertiary">
              질문을 불러오지 못했어요. 눌러서 다시 불러오기
            </AppText>
          </Pressable>
        ) : (
          <AppText variant="heading03" style={styles.titleText}>
            {question ?? ''}
          </AppText>
        )}
      </View>

      <View style={styles.fields}>
        <TextField
          label="제목"
          required
          value={draft.title}
          onChangeText={(title) => updateDraft({ title })}
          placeholder="제목을 입력해 주세요"
          maxLength={maxTitleLength}
          showCount
        />
        <TextField
          label="한줄 코멘트"
          required
          value={draft.oneLine}
          onChangeText={changeOneLine}
          onBlur={() => requestSuggestions(questionId, draft.oneLine)}
          returnKeyType="done"
          placeholder="한줄 코멘트를 적어주세요"
          maxLength={maxOneLineLength}
          showCount
        />
        {hasFailed && (
          <Pressable onPress={() => requestSuggestions(questionId, draft.oneLine)} hitSlop={8}>
            <AppText variant="caption02" color="textTertiary">
              해시태그를 받아 오지 못했어요. 눌러서 다시 받기
            </AppText>
          </Pressable>
        )}
        {/* 후보를 받아 오기 전에는 칸을 아예 숨긴다 */}
        {suggestions.length > 0 && (
          <AiHashtagPicker
            suggestions={suggestions}
            selected={draft.hashtags}
            onChange={(hashtags) => updateDraft({ hashtags })}
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  titleText: {
    flex: 1,
  },
  fields: {
    marginTop: sectionGap,
    gap: spacing.xl,
  },
});
