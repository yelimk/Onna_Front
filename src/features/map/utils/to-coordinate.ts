import type { Coordinate } from '@/features/map/types/home-map-marker';
import type { MyLocation, Coordinate as ServerCoordinate } from '@/types/api';

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

/**
 * 서버에 보낼 내 위치. 위치나 오차 중 하나라도 모르면 null이다.
 * 서버는 lat·lng·accuracy를 셋 다 받거나 셋 다 빼야 해서(일부만 보내면 400), 모르는 값을 지어내 채우지 않는다.
 */
export function toMyLocation(location: Coordinate | null, accuracy: number | null): MyLocation | null {
  return location && accuracy !== null ? { ...toServerCoordinate(location), accuracy } : null;
}
