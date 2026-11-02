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

export function getPasswordConfirmError(password: string, passwordConfirm: string) {
  if (passwordConfirm.length === 0) return undefined;
  return password === passwordConfirm ? undefined : '비밀번호가 일치하지 않습니다';
}

export function getNicknameError(nickname: string) {
  const length = nickname.trim().length;
  if (length === 0) return undefined;
  const isValid = length >= nicknameLength.min && length <= nicknameLength.max;
  return isValid ? undefined : `${nicknameLength.min}~${nicknameLength.max}자로 입력해 주세요`;
}
