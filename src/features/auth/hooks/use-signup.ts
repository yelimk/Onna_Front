import { useState } from 'react';

import { isApiError } from '@/api/api-error';
import { login, signup } from '@/api/auth';
import { requiredTerms, type TermName } from '@/features/auth/components/terms-agreement';
import { goAfterLogin } from '@/features/auth/utils/go-after-login';
import {
  getEmailError,
  getNicknameError,
  getPasswordConfirmError,
  getPasswordError,
} from '@/features/auth/utils/signup-rules';
import { showApiErrorToast } from '@/utils/show-api-error';

export const signupTotalSteps = 4;

type SignupForm = {
  email: string;
  password: string;
  passwordConfirm: string;
  nickname: string;
  agreedTerms: TermName[];
};

/**
 * 회원가입 4단계의 입력값, 칸별 에러, 단계 이동, 가입 요청을 한곳에서 다룬다.
 * 서버는 출입증을 주지 않아서 가입이 끝나면 같은 이메일·비밀번호로 바로 로그인한다.
 */
export function useSignup() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<SignupForm>({
    email: '',
    password: '',
    passwordConfirm: '',
    nickname: '',
    agreedTerms: [],
  });
  // '이미 가입된 이메일'은 서버만 알 수 있어서 가입을 보낸 뒤에야 알게 된다
  const [duplicatedEmail, setDuplicatedEmail] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const errors = {
    email: getEmailError(form.email) ?? (form.email === duplicatedEmail ? '이미 가입된 이메일입니다' : undefined),
    password: getPasswordError(form.password),
    passwordConfirm: getPasswordConfirmError(form.password, form.passwordConfirm),
    nickname: getNicknameError(form.nickname),
  };

  // Figma 회원가입: 규칙에 맞으면 초록 글자로 알려준다 (비밀번호 일치, 닉네임 사용 가능)
  const successes = {
    passwordConfirm:
      form.passwordConfirm.length > 0 && !errors.passwordConfirm ? '비밀번호가 일치합니다' : undefined,
    nickname: form.nickname.trim().length > 0 && !errors.nickname ? '사용할 수 있어요' : undefined,
  };

  const isStepDone = [
    form.email.length > 0 && !errors.email,
    form.password.length > 0 && form.passwordConfirm.length > 0 && !errors.password && !errors.passwordConfirm,
    form.nickname.trim().length > 0 && !errors.nickname,
    form.agreedTerms.length === requiredTerms.length,
  ][step - 1];

  const update = (patch: Partial<SignupForm>) => setForm((prev) => ({ ...prev, ...patch }));

  const submit = async () => {
    // 기다리는 동안 버튼 모양은 그대로 두고, 두 번 눌러도 한 번만 보낸다
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const email = form.email.trim();
      await signup({ email, password: form.password, nickname: form.nickname.trim() });
      await login(email, form.password);
      await goAfterLogin();
    } catch (error) {
      if (isApiError(error, 'EMAIL_DUPLICATED')) {
        setDuplicatedEmail(form.email);
        setStep(1);
      } else {
        showApiErrorToast(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const goNext = () => (step === signupTotalSteps ? submit() : setStep(step + 1));

  return {
    step,
    setStep,
    form,
    update,
    errors,
    successes,
    canGoNext: isStepDone,
    goNext,
  };
}
