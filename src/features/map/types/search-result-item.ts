import type { Coordinate } from '@/features/map/types/home-map-marker';

/**
 * 목록 한 줄로 바꾼 검색결과. 장소와 해시태그는 데이터 모양이 달라서, 화면에서는 이 모양 하나로 그린다.
 * 해시태그 결과의 좌표는 그 해시태그가 붙은 가장 가까운 기록의 자리다.
 */
export type SearchResultItem = {
  key: string;
  kind: 'place' | 'hashtag';
  title: string;
  address: string;
  distanceMeters: number | null;
  coordinate: Coordinate;
  /** 해시태그 결과만: 이 해시태그가 붙은 기록의 자리. 고르면 지도에 핀으로 찍는다. */
  postPins?: PostPin[];
};

/** 서버가 해시태그 검색결과와 함께 주는 기록 자리 */
export type PostPin = {
  postId: string;
  coordinate: Coordinate;
};
