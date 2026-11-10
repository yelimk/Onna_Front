/**
 * 서버 에러 code. 명세서에 나온 것만 적어 두고, 화면은 message 대신 이 code로 갈래를 나눈다.
 * NETWORK_ERROR는 서버까지 닿지 못했을 때 앱이 직접 붙이는 code다.
 */
export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'INVALID_TOKEN'
  | 'INVALID_INPUT'
  | 'LOGIN_FAILED'
  | 'EMAIL_DUPLICATED'
  | 'TAG_NOT_FOUND'
  | 'TOO_FAR'
  | 'RETRY_LOCATION'
  | 'NOT_OPENED'
  | 'FACE_DETECTED'
  | 'NOT_OWNER'
  | 'POST_NOT_FOUND'
  | 'NETWORK_ERROR';

/** 서버가 항상 {status, code, message} 모양으로 돌려주는 에러 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode | (string & {});

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

/** catch로 받은 값이 우리 서버 에러이고 code가 맞는지 */
export function isApiError(error: unknown, code?: ApiErrorCode): error is ApiError {
  return error instanceof ApiError && (code === undefined || error.code === code);
}
