import { Alert } from 'react-native';

import { isApiError } from '@/api/api-error';
import { showToast } from '@/components/toast';

/**
 * 화면에서 따로 처리하지 않은 서버 에러를 알림창으로 보여준다. 여러 기능이 같이 써서 src/utils에 둔다.
 * 칸 옆에 보여줄 에러(비밀번호 틀림 등)는 화면에서 먼저 처리하고, 나머지(인터넷 끊김 등)만 여기로 보낸다.
 */
export function showApiError(error: unknown) {
  Alert.alert('문제가 생겼어요', getErrorMessage(error));
}

/**
 * showApiError와 같지만 알림창 대신 위쪽 토스트로 보여준다. 로그인·회원가입은 Figma 오류 화면이 토스트라서 이걸 쓴다.
 * 다른 화면은 아직 알림창(showApiError)이다.
 */
export function showApiErrorToast(error: unknown) {
  showToast(getErrorMessage(error), 'error');
}

function getErrorMessage(error: unknown) {
  return isApiError(error) ? error.message : '잠시 후 다시 시도해 주세요.';
}
