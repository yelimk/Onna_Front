import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { getMe, saveMyTags, saveMyWalk, saveRegionRelation } from '@/api/users';
import { Button } from '@/components/button';
import { ScreenContainer } from '@/components/screen-container';
import { showToast } from '@/components/toast';
import { spacing } from '@/constants/layout';
import { PlaceStep } from '@/features/auth/components/place-step';
import { RelationStep } from '@/features/auth/components/relation-step';
import { StepTransition } from '@/features/auth/components/step-transition';
import { SurveyDone } from '@/features/auth/components/survey-done';
import { SurveyHeader } from '@/features/auth/components/survey-header';
import { WalkStep } from '@/features/auth/components/walk-step';
import { minPlaceCount, type SurveyAnswers } from '@/features/auth/constants/survey-options';
import { useNearbySpotCount } from '@/features/auth/hooks/use-nearby-spot-count';
import { useTags } from '@/hooks/use-tags';
import { formatHashtag } from '@/utils/format-hashtag';
import { showApiError } from '@/utils/show-api-error';
import { toWalkPreference } from '@/utils/walk-preference';

const totalSteps = 3;

/**
 * 시작: 온보딩 설문.
 * 1/3~3/3과 완료 화면을 한 화면에서 단계(step)만 바꿔 보여준다. step이 totalSteps보다 크면 완료 화면.
 * '완료'를 누르면 대구·경북과의 사이, 걷는 유형, 고른 자리 해시태그를 서버에 저장한다. 저장하면 다음 로그인부터 설문을 건너뛴다.
 * 단계가 바뀌면 300ms 동안 다음 단계로 서서히 바뀐다 (Figma 프로토타입: 스마트 애니메이트 300ms, Ease out).
 * 완료 화면도 같은 방식으로 서서히 나타난다. Figma는 슬라이드 인이지만, 다른 화면으로 넘어가는 슬라이드는
 * 휴대폰 기본 넘김이라 Figma대로 못 해서, 여기만 밀려 들어오면 어색해 빼기로 했다 (팀 결정).
 */
export function SurveyScreen() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<SurveyAnswers>({ placeTagIds: [], walkTimes: [] });
  const [nickname, setNickname] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  // 화면에 처음 들어왔을 때는 첫 단계가 바로 보이게, 단계를 한 번이라도 옮긴 뒤부터 움직인다
  const [hasMoved, setHasMoved] = useState(false);
  const { tags, hasFailed, reload } = useTags();
  const nearbySpotCount = useNearbySpotCount();

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
  const goBack = () => {
    if (step === 1) {
      router.back();
      return;
    }
    setHasMoved(true);
    setStep(step - 1);
  };
  const update = (patch: Partial<SurveyAnswers>) => setAnswers({ ...answers, ...patch });

  const goNext = async () => {
    if (!hasAnswered) {
      if (step === 2) showToast(`해시태그를 ${minPlaceCount}개 이상 선택해 주세요`, 'error');
      return;
    }
    if (step < totalSteps) {
      setHasMoved(true);
      setStep(step + 1);
      return;
    }
    // 저장하는 동안 버튼 모양은 그대로 두고, 두 번 눌러도 한 번만 보낸다
    if (isSaving) return;
    setIsSaving(true);
    try {
      // 해시태그를 저장하면 온보딩이 끝난 것(onboarded)으로 바뀌어서, 관계·걷는 유형을 먼저 저장한다.
      // 앞의 저장이 실패하면 온보딩이 끝나지 않은 채로 남아, '완료'를 다시 누르면 모두 다시 보낸다.
      // '완료'는 세 단계를 다 골라야 눌리므로 relation·walkDuration은 여기서 늘 있다.
      if (answers.relation) await saveRegionRelation(answers.relation);
      if (answers.walkDuration) await saveMyWalk(toWalkPreference(answers.walkTimes, answers.walkDuration));
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
        {/* 완료 화면은 내용을 화면 가운데에 둔다(SurveyDone의 flex: 1). 감싸는 상자도 화면 높이를 채워야 가운데로 간다 */}
        <StepTransition stepKey={step} animate style={styles.fill}>
          <SurveyDone
            answers={answers}
            placeNames={placeNames}
            nickname={nickname}
            nearbySpotCount={nearbySpotCount}
          />
        </StepTransition>
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
      <StepTransition stepKey={step} animate={hasMoved}>
        {step === 1 && <RelationStep value={answers.relation} onChange={(relation) => update({ relation })} />}
        {step === 2 && (
          <PlaceStep
            tags={tags}
            hasFailed={hasFailed}
            onRetry={reload}
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
      </StepTransition>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
