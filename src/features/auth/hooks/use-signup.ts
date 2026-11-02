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
import { showApiError } from '@/utils/show-api-error';

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

  const isStepDone = [
    form.email.length > 0 && !errors.email,
    form.password.length > 0 && form.passwordConfirm.length > 0 && !errors.password && !errors.passwordConfirm,
    form.nickname.trim().length > 0 && !errors.nickname,
    form.agreedTerms.length === requiredTerms.length,
  ][step - 1];

  const update = (patch: Partial<SignupForm>) => setForm((prev) => ({ ...prev, ...patch }));

  const submit = async () => {
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
        showApiError(error);
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
    canGoNext: isStepDone && !isSubmitting,
    isSubmitting,
    goNext,
  };
}
