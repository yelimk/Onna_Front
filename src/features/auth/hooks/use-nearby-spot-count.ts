import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

import { getMapZones } from '@/api/map';

// 정확도를 모르면 '정확하다'고 속이지 않도록 아주 나쁜 값으로 보낸다 (사진 남기기와 같은 기준)
const unknownAccuracyMeters = 999;

/**
 * 설문 완료 화면의 '근처에 흐릿한 자리 N곳'. 지도 홈과 같은 기준(내 위치 반경 500m 구역)으로 서버 사진 수를 더한다.
 * 권한 안내에서 위치를 켠 사람만 셀 수 있어서, 권한이 없거나 위치·서버를 못 받으면 null을 돌려준다(화면은 숫자 없는 문구로 바꾼다).
 * 설문을 마치자마자 보여야 해서, 설문 첫 화면부터 미리 세고 정확한 위치를 기다리지 않고 마지막으로 알던 위치를 먼저 쓴다.
 */
export function useNearbySpotCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let isActive = true;

    const countNearbySpots = async () => {
      const permission = await Location.getForegroundPermissionsAsync();
      if (!permission.granted) return null;
      const position =
        (await Location.getLastKnownPositionAsync()) ??
        (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
      const { latitude, longitude, accuracy } = position.coords;
      const zones = await getMapZones({ lat: latitude, lng: longitude, accuracy: accuracy ?? unknownAccuracyMeters });
      return zones.reduce((sum, zone) => sum + zone.postCount, 0);
    };

    countNearbySpots()
      .then((result) => {
        if (isActive) setCount(result);
      })
      .catch(() => undefined);
    return () => {
      isActive = false;
    };
  }, []);

  return count;
}
