import { router } from 'expo-router';
import { useEffect, useState } from 'react';

import { getMe, saveMyTags } from '@/api/users';
import { Button } from '@/components/button';
import { ScreenContainer } from '@/components/screen-container';
import { showToast } from '@/components/toast';
import { spacing } from '@/constants/layout';
import { PlaceStep } from '@/features/auth/components/place-step';
import { RelationStep } from '@/features/auth/components/relation-step';
import { SurveyDone } from '@/features/auth/components/survey-done';
import { SurveyHeader } from '@/features/auth/components/survey-header';
import { WalkStep } from '@/features/auth/components/walk-step';
import { minPlaceCount, type SurveyAnswers } from '@/features/auth/constants/survey-options';
import { useTags } from '@/hooks/use-tags';
import { formatHashtag } from '@/utils/format-hashtag';
import { showApiError } from '@/utils/show-api-error';

const totalSteps = 3;

// 근처 흐린 자리 수는 지도 API(/map/zones)에 내 위치가 있어야 알 수 있어서, 지도 연결 전까지 예시 값을 쓴다
const previewNearbySpotCount = 12;

/**
 * 시작: 온보딩 설문.
 * 1/3~3/3과 완료 화면을 한 화면에서 단계(step)만 바꿔 보여준다. step이 totalSteps보다 크면 완료 화면.
 * '완료'를 누르면 고른 자리 해시태그를 서버에 저장한다. 저장하면 다음 로그인부터 설문을 건너뛴다.
 */
export function SurveyScreen() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<SurveyAnswers>({ placeTagIds: [], walkTimes: [] });
  const [nickname, setNickname] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { tags } = useTags();

  useEffect(() => {
    getMe()
      .then((me) => setNickname(me.nickname))
      .catch(() => setNickname(''));
  }, []);

  const isDone = step > totalSteps;
  // 버튼은 Figma처럼 늘 주황으로 두고, 덜 골랐으면 넘어가지 않는다.
  // 해시태그는 '3개 이상'이라는 조건이 있어서 그 단계만 토스트로 알려준다.
  const hasAnswered =
    (step === 1 && answers.relation !== undefined) ||
    (step === 2 && answers.placeTagIds.length >= minPlaceCount) ||
    (step === 3 && answers.walkTimes.length > 0 && answers.walkDuration !== undefined);

  const goToMap = () => router.replace('/map');
  const goBack = () => (step === 1 ? router.back() : setStep(step - 1));
  const update = (patch: Partial<SurveyAnswers>) => setAnswers({ ...answers, ...patch });

  const goNext = async () => {
    if (!hasAnswered) {
      if (step === 2) showToast(`해시태그를 ${minPlaceCount}개 이상 선택해 주세요`, 'error');
      return;
    }
    if (step < totalSteps) {
      setStep(step + 1);
      return;
    }
    // 저장하는 동안 버튼 모양은 그대로 두고, 두 번 눌러도 한 번만 보낸다
    if (isSaving) return;
    setIsSaving(true);
    try {
      await saveMyTags(answers.placeTagIds);
      setStep(step + 1);
    } catch (error) {
      showApiError(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isDone) {
    const placeNames = (tags ?? [])
      .filter((tag) => answers.placeTagIds.includes(tag.id))
      .map((tag) => formatHashtag(tag.name));
    return (
      <ScreenContainer footer={<Button label="지도 열기" variant="primary" onPress={goToMap} />}>
        <SurveyDone
          answers={answers}
          placeNames={placeNames}
          nickname={nickname}
          nearbySpotCount={previewNearbySpotCount}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      contentTopGap={spacing.xxl}
      header={<SurveyHeader step={step} totalSteps={totalSteps} onBack={goBack} />}
      footer={
        <Button
          label={step === totalSteps ? '완료' : '다음'}
          variant="primary"
          onPress={goNext}
        />
      }>
      {step === 1 && <RelationStep value={answers.relation} onChange={(relation) => update({ relation })} />}
      {step === 2 && (
        <PlaceStep
          tags={tags}
          value={answers.placeTagIds}
          onChange={(placeTagIds) => update({ placeTagIds })}
        />
      )}
      {step === 3 && (
        <WalkStep
          walkTimes={answers.walkTimes}
          walkDuration={answers.walkDuration}
          onChangeWalkTimes={(walkTimes) => update({ walkTimes })}
          onChangeWalkDuration={(walkDuration) => update({ walkDuration })}
        />
      )}
    </ScreenContainer>
  );
}
