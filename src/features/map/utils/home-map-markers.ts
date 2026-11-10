import type { Coordinate, PhotoMarker } from '@/features/map/types/home-map-marker';
import { getDistanceMeters } from '@/features/map/utils/get-distance-meters';

/**
 * 기준점에서 가장 가까운 기록. 사진 한 장 마커뿐 아니라 묶음 안 대표 사진까지 본다.
 * 거리는 사진의 흐린 좌표로 잰다. 서버도 이 좌표로 흐림 단계·열기를 정해서 같은 기준이다.
 */
export function findNearestPhoto(records: PhotoMarker[], from: Coordinate): PhotoMarker | null {
  let nearest: PhotoMarker | null = null;
  let nearestDistance = Infinity;

  for (const record of records) {
    const distance = getDistanceMeters(from, record.coordinate);
    if (distance < nearestDistance) {
      nearest = record;
      nearestDistance = distance;
    }
  }
  return nearest;
}
