import { apiRequest } from '@/api/client';
import { clearTokens, saveTokens, type Tokens } from '@/api/token-storage';

type SignupInput = {
  email: string;
  /** 8~20자 */
  password: string;
  /** 2~10자 */
  nickname: string;
};

/** 회원가입. 서버는 출입증을 주지 않아서, 가입 뒤 바로 login을 이어 부른다. */
export function signup(input: SignupInput) {
  return apiRequest<{ userId: number }>('/auth/signup', { method: 'POST', body: input, auth: false });
}

/** 로그인하고 받은 출입증(토큰)을 폰에 저장한다. 틀리면 LOGIN_FAILED */
export async function login(email: string, password: string) {
  const tokens = await apiRequest<Tokens>('/auth/login', { method: 'POST', body: { email, password }, auth: false });
  await saveTokens(tokens);
}

/** 서버에 따로 로그아웃 API가 없어서 폰에 저장한 출입증만 지운다 */
export function logout() {
  return clearTokens();
}
