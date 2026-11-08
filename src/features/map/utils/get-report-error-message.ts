import { isApiError } from '@/api/api-error';

/**
 * 신고가 실패했을 때 신고 창 아래 토스트로 보여줄 말.
 * 이유는 앱이 고정된 보기에서만 고르므로, 서버의 INVALID_INPUT은 '내 사진'일 때만 온다.
 */
export function getReportErrorMessage(error: unknown) {
  if (isApiError(error, 'INVALID_INPUT')) return '내가 남긴 사진은 신고할 수 없어요';
  if (isApiError(error, 'POST_NOT_FOUND')) return '이미 지워졌거나 숨겨진 사진이에요';
  return '신고를 보내지 못했어요. 잠시 뒤 다시 해 주세요';
}
