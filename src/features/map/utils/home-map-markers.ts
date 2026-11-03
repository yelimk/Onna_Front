import type { Coordinate, HomeMapMarker, PhotoMarker } from '@/features/map/types/home-map-marker';
import { getDistanceMeters } from '@/features/map/utils/get-distance-meters';

/** 기준점에서 가장 가까운 사진. 묶음은 하나의 기록이 아니라서 뺀다. */
export function findNearestPhoto(markers: HomeMapMarker[], from: Coordinate): PhotoMarker | null {
  let nearest: PhotoMarker | null = null;
  let nearestDistance = Infinity;

  for (const marker of markers) {
    if (marker.kind !== 'photo') continue;
    const distance = getDistanceMeters(from, marker.coordinate);
    if (distance < nearestDistance) {
      nearest = marker;
      nearestDistance = distance;
    }
  }
  return nearest;
}
