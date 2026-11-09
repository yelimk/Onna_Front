import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import { colors } from '@/constants/colors';
import { floatingShadow, radius, spacing } from '@/constants/layout';

/** 흰 사각 버튼(내 위치, 산책 경로 추천) 크기 */
const squareButtonSize = 48;
const cameraButtonSize = 56;

type MapActionButtonsProps = {
  /** 지도를 내 위치로 옮긴다. 지도는 지도 홈이 가지고 있어서 지도 홈의 함수를 받는다. */
  onMyLocationPress: () => void;
  /** 목적지 없이 AI 추천 경로를 받는다. 경로 카드는 지도 홈이 띄워서 지도 홈의 함수를 받는다. */
  onRoutePress: () => void;
  /** 탐색 모드에서 가장 가까운 기록을 펼치면 Figma대로 카메라 버튼을 숨긴다. */
  showCamera?: boolean;
};

/** 지도 오른쪽 아래 버튼 (위에서부터): 내 위치로 가기, 산책 경로 추천(AI 추천 경로), 지금 이 자리 남기기 */
export function MapActionButtons({ onMyLocationPress, onRoutePress, showCamera = true }: MapActionButtonsProps) {
  return (
    <View style={styles.column}>
      {/* Figma '위치 관련 추가사항': 다른 곳을 둘러보다가 내 위치로 돌아오는 버튼. 경로 버튼과 같은 흰 사각 버튼이다. */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="내 위치로 가기"
        onPress={onMyLocationPress}
        style={styles.squareButton}>
        <Icon name="myLocation" size={24} />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="산책 경로 추천"
        onPress={onRoutePress}
        style={styles.squareButton}>
        <Icon name="route" size={24} />
      </Pressable>
      {/* 카메라를 숨겨도 그 자리를 비워 둔다. 그래야 위의 두 버튼이 내려오지 않고 같은 자리에 있다 (Figma 탐색 모드). */}
      {showCamera ? <CameraButton /> : <View style={styles.cameraSlot} />}
    </View>
  );
}

/** 주황 카메라 버튼: 지금 이 자리 남기기. 경로를 보는 화면에서도 따로 쓴다. */
export function CameraButton() {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="지금 이 자리 남기기"
      onPress={() => router.push('/upload/camera')}
      style={styles.cameraButton}>
      <Icon name="camera" size={28} color="textInverse" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  column: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  squareButton: {
    ...floatingShadow,
    width: squareButtonSize,
    height: squareButtonSize,
    borderRadius: radius.md,
    backgroundColor: colors.background01,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 빈 자리라 터치는 아래 지도·패널로 넘긴다.
  cameraSlot: {
    width: cameraButtonSize,
    height: cameraButtonSize,
    pointerEvents: 'none',
  },
  cameraButton: {
    ...floatingShadow,
    width: cameraButtonSize,
    height: cameraButtonSize,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
