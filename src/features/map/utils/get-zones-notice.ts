/**
 * 지도 구역을 받지 못했을 때 지도 위에 띄울 한 줄. 이유(서버 에러 code)마다 사용자가 할 일을 알려준다.
 * 받은 구역이 있으면 지도는 그대로 두고 이 안내만 덧붙인다.
 */
export function getZonesNotice(errorCode: string | null) {
  if (!errorCode) return null;
  if (errorCode === 'UNAUTHORIZED' || errorCode === 'INVALID_TOKEN') return '로그인하면 남겨진 기록이 보여요';
  if (errorCode === 'NETWORK_ERROR') return '인터넷 연결을 확인해 주세요';
  return '기록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요';
}
