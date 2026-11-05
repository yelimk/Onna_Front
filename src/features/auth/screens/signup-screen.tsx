import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { ScreenContainer } from '@/components/screen-container';
import { TextField } from '@/components/text-field';
import { sectionGap, spacing } from '@/constants/layout';
import { SignupHeader } from '@/features/auth/components/signup-header';
import { StepTitle } from '@/features/auth/components/step-title';
import { StepTransition } from '@/features/auth/components/step-transition';
import { TermsAgreement } from '@/features/auth/components/terms-agreement';
import { signupTotalSteps, useSignup } from '@/features/auth/hooks/use-signup';
import { nicknameLength } from '@/features/auth/utils/signup-rules';

/**
 * 시작: 회원가입 4단계 (이메일 → 비밀번호 → 닉네임 → 약관).
 * 칸마다 규칙을 검사해 칸을 떠날 때 빨간 문구로 알려주고, 마지막 단계에서 서버에 가입한 뒤 바로 로그인한다.
 * 이미 가입된 이메일이면 1단계로 돌아가 이메일 칸에 알려준다.
 * 단계가 바뀌면 300ms 동안 다음 단계로 서서히 바뀐다 (Figma 프로토타입: 스마트 애니메이트·디졸브 300ms, Ease out).
 * Figma처럼 1단계만 '다음' 버튼이 입력칸 바로 아래에 있고(키보드에 가리지 않게), 2~4단계는 화면 아래에 있다.
 * 제목 아래 간격도 Figma처럼 설명이 없는 1·2단계는 40, 설명이 있는 3·4단계는 24다.
 */
export function SignupScreen() {
  const { step, setStep, form, update, errors, successes, markLeft, canGoNext, goNext } = useSignup();
  // 화면에 처음 들어왔을 때는 첫 단계가 바로 보이게, 단계를 한 번이라도 옮긴 뒤부터 움직인다
  const [hasMoved, setHasMoved] = useState(false);
  const goBack = () => {
    if (step === 1) {
      router.back();
      return;
    }
    setHasMoved(true);
    setStep(step - 1);
  };
  const handleNext = () => {
    setHasMoved(true);
    goNext();
  };
  const nextButton = <Button label="다음" variant="primary" disabled={!canGoNext} onPress={handleNext} />;

  return (
    <ScreenContainer
      contentTopGap={spacing.xxl}
      header={<SignupHeader step={step} totalSteps={signupTotalSteps} onBack={goBack} />}
      footer={step === 1 ? undefined : nextButton}>
      <StepTransition stepKey={step} animate={hasMoved}>
        {step === 1 && (
          <>
            <StepTitle gapBelow={sectionGap} title="이메일을 알려주세요" />
            <TextField
              label="이메일"
              placeholder="이메일을 입력해 주세요"
              value={form.email}
              onChangeText={(email) => update({ email })}
              error={errors.email}
              onBlur={() => markLeft('email')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <View style={styles.inlineButton}>{nextButton}</View>
          </>
        )}

        {step === 2 && (
          <>
            <StepTitle gapBelow={sectionGap} title="비밀번호를 만들어 주세요" />
            <View style={styles.fields}>
              <TextField
                label="비밀번호"
                placeholder="비밀번호를 입력해 주세요"
                value={form.password}
                onChangeText={(password) => update({ password })}
                error={errors.password}
                onBlur={() => markLeft('password')}
                isPassword
                autoComplete="new-password"
              />
              <TextField
                label="비밀번호 확인"
                placeholder="비밀번호를 다시 입력해 주세요"
                value={form.passwordConfirm}
                onChangeText={(passwordConfirm) => update({ passwordConfirm })}
                error={errors.passwordConfirm}
                success={successes.passwordConfirm}
                isPassword
                autoComplete="new-password"
              />
            </View>
          </>
        )}

        {step === 3 && (
          <>
            <StepTitle
              gapBelow={spacing.xl}
              title="어떻게 불러드릴까요?"
              description={'닉네임은 내 화면에서만 보여요.\n남긴 사진은 늘 익명으로 건네져요.'}
            />
            <TextField
              label="닉네임"
              placeholder="닉네임을 입력해 주세요"
              value={form.nickname}
              onChangeText={(nickname) => update({ nickname })}
              error={errors.nickname}
              onBlur={() => markLeft('nickname')}
              success={successes.nickname}
              maxLength={nicknameLength.max}
            />
          </>
        )}

        {step === 4 && (
          <>
            <StepTitle gapBelow={spacing.xl} title="약관에 동의해 주세요" description="위치 기반 서비스라 꼭 필요한 동의가 있어요" />
            <TermsAgreement agreed={form.agreedTerms} onChange={(agreedTerms) => update({ agreedTerms })} />
          </>
        )}
      </StepTransition>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: spacing.xl,
  },
  // Figma 회원가입 1단계: 입력칸(안내 문구 포함) 아래 40
  inlineButton: {
    marginTop: sectionGap,
  },
});
