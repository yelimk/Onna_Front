import { isApiError } from '@/api/api-error';
import { showToast } from '@/components/toast';

/**
 * 화면에서 따로 처리하지 않은 서버 에러(인터넷 끊김, 서버 오류 등)를 위쪽 빨간 토스트로 보여준다.
 * Figma에 서버 오류 화면이 없어서, Figma 컴포넌트에 있는 토스트로 앱 전체를 통일했다 (팀 결정). 여러 기능이 같이 써서 src/utils에 둔다.
 * 칸 옆에 보여줄 에러(비밀번호 틀림 등)는 화면에서 먼저 처리하고, 나머지만 여기로 보낸다.
 */
export function showApiError(error: unknown) {
  showToast(isApiError(error) ? error.message : '잠시 후 다시 시도해 주세요.', 'error');
}
