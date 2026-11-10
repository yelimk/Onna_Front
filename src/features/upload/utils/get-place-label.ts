import { getZoneAt } from '@/api/map';
import { getRegionName } from '@/features/map/api/get-region-name';
import type { Coordinate } from '@/types/api';

/**
 * 위치 확인 화면 핀 위에 보여 줄 장소 이름.
 * 구역 안이면 서버 구역 이름('B구역 중앙도서관·상경관')을 쓴다. 기록이 실제로 묶이는 이름이라 동네 이름보다 정확하다 (QA 요청).
 * 구역 밖이거나 서버가 실패하면 지도 담당의 카카오 동네 이름('경산시 조영동')으로, 그것도 없으면 빈 글자를 준다.
 */
export async function getPlaceLabel(location: Coordinate) {
  const zone = await getZoneAt(location).catch(() => null);
  if (zone?.name) return zone.name;
  return getRegionName({ latitude: location.lat, longitude: location.lng }).catch(() => '');
}
