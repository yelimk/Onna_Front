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
  passwordLength,
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

/** 다 쓰고 떠난 뒤에야 틀렸다고 알려주는 칸 */
type CheckedField = 'email' | 'password' | 'nickname';

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

  // 치는 중에 첫 글자부터 빨간 문구가 뜨면 방해가 돼서, 칸을 한 번 떠난 뒤부터 알려준다.
  // 한 번 떠난 칸은 다시 고칠 때 바로바로 알려준다 (고쳐졌는지 바로 보이게).
  const [leftFields, setLeftFields] = useState<CheckedField[]>([]);
  const markLeft = (field: CheckedField) =>
    setLeftFields((prev) => (prev.includes(field) ? prev : [...prev, field]));
  const hasLeft = (field: CheckedField) => leftFields.includes(field);

  // 칸이 맞는지는 늘 검사한다 ('다음' 버튼을 켤지 정할 때 쓴다). 화면에 보여줄지는 아래 errors에서 정한다.
  const ruleErrors = {
    email: getEmailError(form.email),
    password: getPasswordError(form.password),
    passwordConfirm: getPasswordConfirmError(form.password, form.passwordConfirm),
    nickname: getNicknameError(form.nickname),
  };
  const isPasswordTooLong = form.password.length > passwordLength.max;

  const errors = {
    // '이미 가입된 이메일'은 서버가 알려준 것이라 바로 보여준다
    email:
      (hasLeft('email') ? ruleErrors.email : undefined) ??
      (form.email === duplicatedEmail ? '이미 가입된 이메일입니다' : undefined),
    // 20자를 넘긴 건 더 칠수록 틀어지니까 칸을 떠나기 전에도 바로 알려준다
    password: hasLeft('password') || isPasswordTooLong ? ruleErrors.password : undefined,
    // 비밀번호 확인은 규칙 쪽에서 '맞게 치는 중'이면 알려주지 않는다 (signup-rules.ts)
    passwordConfirm: ruleErrors.passwordConfirm,
    nickname: hasLeft('nickname') ? ruleErrors.nickname : undefined,
  };

  // Figma 회원가입: 규칙에 맞으면 초록 글자로 알려준다 (비밀번호 일치, 닉네임 사용 가능)
  // 비밀번호 확인은 치는 중에는 에러도 없어서, 둘이 똑같을 때만 초록 문구를 띄운다
  const isPasswordConfirmed = form.passwordConfirm.length > 0 && form.passwordConfirm === form.password;
  const successes = {
    passwordConfirm: isPasswordConfirmed ? '비밀번호가 일치합니다' : undefined,
    nickname: form.nickname.trim().length > 0 && !ruleErrors.nickname ? '사용할 수 있어요' : undefined,
  };

  const isStepDone = [
    form.email.length > 0 && !ruleErrors.email && form.email !== duplicatedEmail,
    form.password.length > 0 && !ruleErrors.password && isPasswordConfirmed,
    form.nickname.trim().length > 0 && !ruleErrors.nickname,
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
    successes,
    markLeft,
    canGoNext: isStepDone,
    goNext,
  };
}
