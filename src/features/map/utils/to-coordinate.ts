import type { Coordinate } from '@/features/map/types/home-map-marker';
import type { Coordinate as ServerCoordinate } from '@/types/api';

/*
 * 서버는 위치를 lat·lng로, 카카오맵·expo-location은 latitude·longitude로 주고받는다.
 * 지도 기능 안에서는 latitude·longitude 하나로 쓰고, 서버와 주고받는 순간에만 바꾼다.
 */

export function fromServerCoordinate({ lat, lng }: ServerCoordinate): Coordinate {
  return { latitude: lat, longitude: lng };
}

export function toServerCoordinate({ latitude, longitude }: Coordinate): ServerCoordinate {
  return { lat: latitude, lng: longitude };
}
