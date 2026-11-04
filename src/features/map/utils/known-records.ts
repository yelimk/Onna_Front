import type { PhotoMarker } from '@/features/map/types/home-map-marker';

/*
 * 묶음 목록·경로 추천에서 받은 기록을 앱이 켜져 있는 동안 기억한다.
 * 지도 구역은 대표 사진만 주므로, 목록이나 경로에서 처음 본 기록을 사진 카드·길안내가 다시 찾을 수 있게 한다.
 * 같은 기록을 나중에 받으면 새 값(새 사진 주소)으로 덮는다.
 */
const knownRecords = new Map<string, PhotoMarker>();

export function rememberRecords(records: PhotoMarker[]) {
  records.forEach((record) => knownRecords.set(record.id, record));
}

/** 받아 둔 기록 한 건. 아직 받은 적 없으면 undefined */
export const findKnownRecord = (postId: string) => knownRecords.get(postId);
