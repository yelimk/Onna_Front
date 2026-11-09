import type { Coordinate, PhotoMarker } from '@/features/map/types/home-map-marker';
import { getDistanceMeters } from '@/features/map/utils/get-distance-meters';

/**
 * 기준점에서 가장 가까운 기록. 사진 한 장 마커뿐 아니라 묶음 안 대표 사진까지 본다.
 * 거리는 서버가 잰 실제 거리(10m 단위)를 먼저 쓴다. 사진 좌표는 일부러 흐린 좌표라 앱이 재면 순서가 틀릴 수 있다.
 * 서버 거리가 없으면(위치 없이 받음) 앱이 흐린 좌표로 잰다.
 */
export function findNearestPhoto(records: PhotoMarker[], from: Coordinate): PhotoMarker | null {
  let nearest: PhotoMarker | null = null;
  let nearestDistance = Infinity;

  for (const record of records) {
    const distance = record.serverDistanceMeters ?? getDistanceMeters(from, record.coordinate);
    if (distance < nearestDistance) {
      nearest = record;
      nearestDistance = distance;
    }
  }
  return nearest;
}
