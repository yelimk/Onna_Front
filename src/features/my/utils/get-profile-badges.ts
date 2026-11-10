import type { Badge } from '@/types/api';

/**
 * 온보딩을 마치면 누구나 갖는 칭호 (기획 요청).
 * 조건이 없어서 서버에 두지 않고 앱이 항상 맨 앞에 붙인다. 조건이 생기면 서버 badges로 옮긴다.
 * 마이 탭은 온보딩을 마친 사람만 들어올 수 있어서 따로 확인하지 않는다.
 */
const beginnerBadge = '초보 탐험가';

/**
 * 마이 탭 닉네임 아래 칭호: 초보 탐험가 다음에 서버에서 얻은 칭호(earned)만 서버가 준 순서대로 붙인다.
 * 서버는 얻은 시각을 주지 않아서 얻은 순서로는 놓을 수 없다.
 */
export function getProfileBadges(badges: Badge[] = []) {
  return [beginnerBadge, ...badges.filter((badge) => badge.earned).map((badge) => badge.name)];
}
