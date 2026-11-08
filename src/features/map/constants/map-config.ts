import type { Coordinate } from '@/features/map/types/home-map-marker';

/** 카카오 개발자 콘솔의 JavaScript 키. `.env`에 넣고, 없으면 지도 대신 회색 지도를 보여준다. */
export const kakaoMapJsKey = process.env.EXPO_PUBLIC_KAKAO_MAP_JS_KEY ?? '';

/** 카카오 개발자 콘솔의 REST API 키. 장소 검색(카카오 로컬 API)에 쓴다. JavaScript 키와 다르다. */
export const kakaoRestApiKey = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY ?? '';

/** SK open API의 TMAP 앱 키. 걷는 길을 따라 경로를 그린다. 없으면 직선 경로로 대신한다. */
export const tmapAppKey = process.env.EXPO_PUBLIC_TMAP_APP_KEY ?? '';

/**
 * WebView 안 지도 페이지의 주소.
 * 카카오는 등록된 도메인에서만 지도를 열어 주므로, 카카오 개발자 콘솔 > 플랫폼 > Web에 이 값을 등록해야 한다.
 */
export const kakaoMapBaseUrl = 'http://localhost';

/** 내 위치를 아직 모를 때 보여주는 곳 (영남대학교) */
export const defaultMapCenter: Coordinate = { latitude: 35.8306, longitude: 128.7544 };

/**
 * 장소 검색은 캠퍼스 가운데(defaultMapCenter)에서 이 거리 안만 찾는다.
 * 기획서 MVP 범위가 '영남대 캠퍼스와 학교 앞'이라, 같은 이름의 먼 곳(칠곡·진량의 '정문' 등)은 결과와 지도에서 뺀다.
 * 캠퍼스 끝(정문·후문)과 학교 앞 동네까지 들어오는 거리다.
 */
export const placeSearchRadiusMeters = 1500;

/** 카카오맵 확대 단계. 작을수록 자세히 보이고, 3은 골목과 건물이 보이는 정도다. */
export const defaultMapLevel = 3;

/**
 * 이 거리 안에 들어온 사진은 열린다. 서버가 사진 열기(POST /posts/{id}/open)를 25m 안에서만 허락해서 같은 값을 쓴다.
 * 탐색 모드의 원, 길안내 '범위 내 기록들', 사진 카드의 '가까우면 열어 보기'가 모두 이 값을 따른다.
 */
export const openRadiusMeters = 25;

/** 고른 장소에서 이 거리 안의 기록을 '이 근처 남겨진 기록'으로 센다. 걸어서 5분 안쪽이다. */
export const nearbyRecordRadiusMeters = 300;

/** 경로 추천을 받지 못해 앱이 대신 고를 때 '가는 길'로 보는 폭(m). 내 위치→목적지 직선에서 이만큼 안쪽의 기록만 들른다. */
export const routeCorridorMeters = 250;

/** 경로에 들를 자리 수. TMAP 경유지는 5곳까지라 그 안에서, 걷기 부담이 적게 3곳으로 둔다. */
export const maxRouteStops = 3;

/** 직선 경로일 때 걸리는 시간을 셀 걸음 속도(m/s). 보통 걸음 약 시속 4km. */
export const walkingSpeedMetersPerSecond = 1.1;

/**
 * 지도 구역(/map/zones)·묶음 사진·연 사진을 다시 받는 간격. 서버가 주는 사진 주소가 30분 뒤 만료되어서, 그보다 조금 빨리 새로 받는다.
 */
export const zonesRefreshMs = 25 * 60 * 1000;

/**
 * 이만큼 걸으면 구역을 다시 받는다. 흐림 단계(S0→OPEN)는 서버가 내 위치로 정해서,
 * 다시 받아야 가까워진 사진이 열린다. 위치를 5m마다 받으므로 매번 묻지 않도록 간격을 둔다.
 */
export const zonesRefetchMeters = 30;

/**
 * 경로 추천(GET /recommendations/route)에 보낼 산책 시간을 셀 때, 직선 거리에 곱하는 값.
 * 길은 직선보다 돌아가므로 조금 늘려 잡는다.
 */
export const routeDetourFactor = 1.3;

/** 목적지가 아주 가까워도 들를 자리를 고를 여유를 주는 가장 짧은 산책 시간(분) */
export const minRouteMinutes = 10;

/** 서버가 받는 가장 긴 산책 시간(분). 넘기면 INVALID_INPUT이라 여기서 자른다. */
export const maxRouteMinutes = 60;
