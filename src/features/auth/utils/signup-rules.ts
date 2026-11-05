/**
 * 회원가입 입력 규칙. 서버(명세서)와 같은 규칙을 앱에서 먼저 검사한다.
 * 서버는 어느 칸이 틀렸는지 알려주지 않고 INVALID_INPUT 하나만 주기 때문에, 칸마다 바로 알려주려면 앱이 먼저 봐야 한다.
 * 비어 있는 칸은 아직 안 쓴 것이라 에러로 보지 않는다 (처음부터 빨갛게 보이지 않게).
 */

export const passwordLength = { min: 8, max: 20 } as const;
export const nicknameLength = { min: 2, max: 10 } as const;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function getEmailError(email: string) {
  if (email.length === 0) return undefined;
  return emailPattern.test(email.trim()) ? undefined : '이메일 형식이 아니에요';
}

export function getPasswordError(password: string) {
  if (password.length === 0) return undefined;
  const isValid = password.length >= passwordLength.min && password.length <= passwordLength.max;
  return isValid ? undefined : `${passwordLength.min}~${passwordLength.max}자로 입력해 주세요`;
}

/**
 * 아직 맞게 치는 중(비밀번호 앞부분과 같음)이면 틀렸다고 하지 않는다.
 * 그래야 다 쳤을 때 '비밀번호가 일치합니다'가 닉네임 '사용할 수 있어요'처럼 빈 자리에서 내려오며 나타난다 (Figma: 비밀번호 확인도 동일).
 * 한 글자라도 다르게 치거나 더 길게 치면 바로 알려준다.
 */
export function getPasswordConfirmError(password: string, passwordConfirm: string) {
  if (passwordConfirm.length === 0) return undefined;
  if (password === passwordConfirm) return undefined;
  const isStillTyping = passwordConfirm.length < password.length && password.startsWith(passwordConfirm);
  return isStillTyping ? undefined : '비밀번호가 일치하지 않습니다';
}

export function getNicknameError(nickname: string) {
  const length = nickname.trim().length;
  if (length === 0) return undefined;
  const isValid = length >= nicknameLength.min && length <= nicknameLength.max;
  return isValid ? undefined : `${nicknameLength.min}~${nicknameLength.max}자로 입력해 주세요`;
}
