import { useMemo, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { KakaoMapView } from '@/features/map/kakao-map/kakao-map-view';
import type { Coordinate } from '@/features/map/types/home-map-marker';

type PlacePreviewMapProps = {
  /** 핀이 가리킬 자리. 아직 모르면 null (지도 기본 가운데를 보여준다) */
  coordinate: Coordinate | null;
  /** 지도 가운데에 올릴 핀 (이름표 + 핀 그림) */
  pin: ReactNode;
  /** 핀 묶음 아래 끝에서 핀의 뾰족한 끝까지 거리(px). 그림자처럼 끝 아래에 여백이 있는 그림이면 그만큼 준다. */
  pinTipInset?: number;
};

const noMarkers: never[] = [];
const ignorePress = () => {};

/**
 * 한 자리만 보여주는 작은 지도 (남기기 3/3 위치 확인).
 * 핀은 Figma 그대로 칸 가운데에 두고, 핀의 뾰족한 끝이 그 자리를 가리키도록 지도를 그만큼 민다.
 * 화면이 스크롤되는 칸 안이라 지도는 손으로 움직이지 않게 막는다.
 */
export function PlacePreviewMap({ coordinate, pin, pinTipInset = 0 }: PlacePreviewMapProps) {
  const [pinHeight, setPinHeight] = useState(0);
  // 핀 묶음이 가운데에 있으므로, 뾰족한 끝은 칸 가운데보다 (핀 높이 / 2 - 아래 여백)만큼 아래에 있다.
  const tipOffset = Math.max(0, pinHeight / 2 - pinTipInset);

  // 한 곳을 맞출 때 지도는 가리는 영역(padding)을 뺀 남은 칸의 가운데에 그 자리를 둔다.
  // 위쪽을 끝 거리의 두 배만큼 가렸다고 하면, 그 자리가 정확히 끝 거리만큼 아래에 온다.
  const focus = useMemo(
    () =>
      coordinate && pinHeight > 0
        ? { coordinates: [coordinate], padding: { top: tipOffset * 2, right: 0, bottom: 0, left: 0 } }
        : undefined,
    [coordinate, pinHeight, tipOffset],
  );

  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <KakaoMapView markers={noMarkers} myLocation={null} focus={focus} onMarkerPress={ignorePress} />
      </View>
      <View style={styles.center} pointerEvents="none">
        <View onLayout={({ nativeEvent }) => setPinHeight(nativeEvent.layout.height)}>{pin}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
