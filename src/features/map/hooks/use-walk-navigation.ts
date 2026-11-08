import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';

import { getWalkRoute, toWalkRoute } from '@/features/map/api/get-walk-route';
import { defaultMapCenter, walkingSpeedMetersPerSecond } from '@/features/map/constants/map-config';
import { useHomeMapMarkers } from '@/features/map/hooks/use-home-map-markers';
import { useRecordsInRange } from '@/features/map/hooks/use-records-in-range';
import type { Coordinate } from '@/features/map/types/home-map-marker';
import type { WalkRoute } from '@/features/map/types/walk-route';
import { getDistanceMeters } from '@/features/map/utils/get-distance-meters';
import { findKnownRecord } from '@/features/map/utils/known-records';
import { findPassedPath } from '@/features/map/utils/open-search-result';
import { locateOnRoute, splitRoute } from '@/features/map/utils/route-progress';

type NavigationParams = {
  destinationName?: string;
  latitude?: string;
  longitude?: string;
  stopIds?: string;
  /** 지도 홈 AI 추천 경로에서 받은 길의 번호 (openNavigation) */
  pathId?: string;
};

/** 들를 자리·목적지에 이만큼(m) 다가오면 도착한 것으로 본다. GPS 오차를 생각한 값이다. */
const arrivalMeters = 25;

/** 목적지에서 이 거리 안에 남겨진 기록을 '이 자리의 기록'으로 보고, 도착하면 연다. */
const unlockMatchMeters = 50;

/**
 * 길안내 (Figma '지도 길안내 UI'). 경로 추천에서 넘겨받은 목적지와 들를 자리로 걷는 길을 받고,
 * 내 위치가 바뀔 때마다 경로 위 어디쯤인지, 다음 자리까지 몇 분인지, 열림 반경 안에 어떤 기록이 있는지 다시 센다.
 */
export function useWalkNavigation(myLocation: Coordinate | null) {
  const params = useLocalSearchParams<NavigationParams>();
  const { records } = useHomeMapMarkers(myLocation);

  const destination = useMemo<Coordinate | null>(
    () =>
      params.latitude && params.longitude
        ? { latitude: Number(params.latitude), longitude: Number(params.longitude) }
        : null,
    [params.latitude, params.longitude],
  );
  const stops = useMemo(() => {
    const ids = params.stopIds ? params.stopIds.split(',') : [];
    // 서버가 추천한 자리는 지도 구역에 없을 수 있어서, 경로 추천 때 기억해 둔 기록에서도 찾는다.
    return ids.map((id) => records.find((record) => record.id === id) ?? findKnownRecord(id)).filter((stop) => stop !== undefined);
  }, [params.stopIds, records]);

  // 출발점은 길안내를 시작한 순간의 위치로 고정한다. 위치를 모르면 캠퍼스에서 출발한다고 본다.
  const [start, setStart] = useState<Coordinate | null>(null);
  if (!start && myLocation) setStart(myLocation);
  const routeStart = start ?? defaultMapCenter;

  // 지도 홈 AI 추천 경로가 넘긴 길이 있으면 그 길을 그대로 쓴다. 지도 홈에서 본 선과 길안내 선이 같아야 헷갈리지 않는다.
  const passedRoute = useMemo(() => {
    const path = findPassedPath(params.pathId);
    return path ? toWalkRoute(path, false) : null;
  }, [params.pathId]);

  const [fetchedRoute, setRoute] = useState<WalkRoute | null>(null);
  const route = passedRoute ?? fetchedRoute;
  useEffect(() => {
    if (!destination || passedRoute) return;
    const controller = new AbortController();
    getWalkRoute(
      { start: routeStart, destination, destinationName: params.destinationName ?? '', stops },
      controller.signal,
    )
      .then(setRoute)
      .catch(() => {});
    return () => controller.abort();
  }, [routeStart, destination, params.destinationName, stops, passedRoute]);

  const current = myLocation ?? routeStart;

  const progress = useMemo(() => {
    if (!route || !destination) return null;
    const position = locateOnRoute(route.path, current);
    // 들를 자리를 경로 위 거리로 바꿔, 아직 지나지 않은 첫 자리를 다음 목표로 삼는다.
    const nextStop = stops.find((stop) => {
      const stopAlong = locateOnRoute(route.path, stop.coordinate).alongMeters;
      return stopAlong - position.alongMeters > arrivalMeters && getDistanceMeters(current, stop.coordinate) > arrivalMeters;
    });
    const target = nextStop?.coordinate ?? destination;
    const remainingMeters = Math.max(0, locateOnRoute(route.path, target).alongMeters - position.alongMeters);
    return {
      ...splitRoute(route.path, position),
      isHeadingToDestination: !nextStop,
      hasArrived: !nextStop && getDistanceMeters(current, destination) <= arrivalMeters,
      minutesToTarget: Math.max(1, Math.ceil(remainingMeters / walkingSpeedMetersPerSecond / 60)),
    };
  }, [route, destination, stops, current]);

  // '범위 내 기록들': 내 위치 열림 반경 안의 기록을 서버 추천순으로
  const recordsInRange = useRecordsInRange(current, myLocation);

  // 도착하면 목적지에 가장 가까이 남겨진 기록 하나가 열린다 (Figma '사진 해금 UI'). 없으면 열 기록이 없다.
  const unlockedRecord = useMemo(() => {
    if (!progress?.hasArrived || !destination) return null;
    // 지도 홈 기록은 구역 대표 사진뿐이라, 범위 내 기록(구역 사진 전체)도 같이 본다.
    // AI 추천 경로는 마지막 자리(대표 사진이 아닐 수 있음)가 목적지라서 이게 없으면 도착해도 열리지 않을 수 있다.
    const nearest = [...recordsInRange, ...records]
      .map((record) => ({ record, distance: getDistanceMeters(destination, record.coordinate) }))
      .filter(({ distance }) => distance <= unlockMatchMeters)
      .sort((a, b) => a.distance - b.distance)[0];
    return nearest?.record ?? null;
  }, [progress?.hasArrived, destination, records, recordsInRange]);

  return {
    destinationName: params.destinationName ?? '',
    destination,
    /** 출발점부터 목적지까지 전체 경로. 지도를 처음 맞출 때 쓴다. */
    fullPath: route?.path ?? null,
    progress,
    recordsInRange,
    unlockedRecord,
  };
}
