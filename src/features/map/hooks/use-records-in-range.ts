import { useEffect, useMemo, useRef, useState } from 'react';

import { getMapZones, getZonePosts } from '@/api/map';
import { openRadiusMeters, zonesRefetchMeters, zonesRefreshMs } from '@/features/map/constants/map-config';
import { useHomeMapMarkers } from '@/features/map/hooks/use-home-map-markers';
import { useLocationAccuracy } from '@/features/map/hooks/use-my-location';
import type { Coordinate, PhotoMarker } from '@/features/map/types/home-map-marker';
import { getDistanceMeters } from '@/features/map/utils/get-distance-meters';
import { rememberRecords } from '@/features/map/utils/known-records';
import { toMyLocation, toServerCoordinate } from '@/features/map/utils/to-coordinate';
import { toPhotoMarker } from '@/features/map/utils/zones-to-markers';
import type { MyLocation } from '@/types/api';

/**
 * 이 거리 안에 가운데가 있는 구역만 사진 목록을 받는다.
 * 열림 반경(25m) 안 기록이 든 구역은 이 안에 들어오고(구역은 반경 100m 남짓), 먼 구역까지 묻지 않게 한다.
 */
const inRangeZoneMeters = 300;

/** 내 위치 둘레 구역의 사진을 서버 추천순(취향 점수, GET /zones/{zoneId}/posts 기본 정렬)으로 받는다. 가까운 구역부터 잇는다. */
async function loadRankedRecords(current: Coordinate, myLocation: MyLocation | null) {
  const zones = await getMapZones(myLocation, { center: toServerCoordinate(current), radius: inRangeZoneMeters });
  const nearestZonesFirst = zones
    .filter((zone) => zone.postCount > 0)
    .map((zone) => ({ zone, distance: getDistanceMeters(current, { latitude: zone.lat, longitude: zone.lng }) }))
    .sort((a, b) => a.distance - b.distance);
  const lists = await Promise.all(
    nearestZonesFirst.map(({ zone }) =>
      getZonePosts(zone.zoneId, myLocation)
        .then((posts) => posts.map((post) => toPhotoMarker(zone, post)))
        .catch(() => [] as PhotoMarker[]),
    ),
  );
  return lists.flat();
}

const isInRange = (current: Coordinate, record: PhotoMarker) =>
  getDistanceMeters(current, record.coordinate) <= openRadiusMeters;

/**
 * 길안내 '범위 내 기록들': 내 위치 열림 반경(25m) 안의 기록을 Figma처럼 AI 추천순(서버 취향 점수 순)으로 보여준다.
 * 지도 홈이 가진 기록은 구역 대표 사진(1~2장)뿐이라, 둘레 구역의 사진 목록을 따로 받아 빠지는 기록이 없게 한다.
 * 30m 걷거나 사진 주소가 만료되기 전(25분)에만 다시 받는다. 받기 전·실패하면 지도 홈 기록을 가까운 순으로 보여준다.
 * 구역 밖에 남긴 기록은 구역 사진 목록에 없어서, 지도 홈 기록에서 찾아 뒤에 가까운 순으로 붙인다.
 */
export function useRecordsInRange(current: Coordinate, myLocation: Coordinate | null) {
  const { records: homeRecords } = useHomeMapMarkers(myLocation);
  const accuracy = useLocationAccuracy();
  const [fetched, setFetched] = useState<PhotoMarker[] | null>(null);
  // 마지막으로 물은 자리와 시각. 화면에 그리는 값이 아니라서 상태 대신 ref에 둔다.
  const lastRequest = useRef<{ origin: Coordinate; at: number; hasLocation: boolean } | null>(null);

  useEffect(() => {
    const serverLocation = toMyLocation(myLocation, accuracy);
    const last = lastRequest.current;
    // 흐림 단계는 서버가 내 위치로 정해서, 위치 오차가 잡히기 전에 받은 목록(전부 흐림)은 위치가 잡히면 다시 받는다.
    const isStale =
      !last ||
      last.hasLocation !== (serverLocation !== null) ||
      Date.now() - last.at >= zonesRefreshMs ||
      getDistanceMeters(current, last.origin) >= zonesRefetchMeters;
    if (!isStale) return;
    // 받는 중에 다시 묻지 않도록 보내기 전에 적어 둔다. 실패해도 그 자리에서 바로 다시 묻지 않고 지도 홈 기록으로 대신한다.
    lastRequest.current = { origin: current, at: Date.now(), hasLocation: serverLocation !== null };
    loadRankedRecords(current, serverLocation)
      .then((records) => {
        // 목록에서 누른 기록의 사진 카드가 바로 사진·해시태그를 보여주게 기억해 둔다.
        rememberRecords(records);
        setFetched(records);
      })
      .catch(() => {});
  }, [current, myLocation, accuracy]);

  return useMemo(() => {
    const ranked = (fetched ?? []).filter((record) => isInRange(current, record));
    const rankedIds = new Set(ranked.map(({ id }) => id));
    const rest = homeRecords
      .filter((record) => !rankedIds.has(record.id) && isInRange(current, record))
      .sort((a, b) => getDistanceMeters(current, a.coordinate) - getDistanceMeters(current, b.coordinate));
    return [...ranked, ...rest];
  }, [fetched, homeRecords, current]);
}
