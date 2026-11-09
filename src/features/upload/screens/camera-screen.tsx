import { useCameraPermissions, type CameraView } from 'expo-camera';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { Icon } from '@/components/icon';
import { colors } from '@/constants/colors';
import { radius, screenPaddingX, spacing } from '@/constants/layout';
import { CameraViewfinder } from '@/features/upload/components/camera-viewfinder';
import { getRegionName } from '@/features/map/api/get-region-name';
import { useUploadDraft } from '@/features/upload/upload-draft';
import { getPhotoLocation } from '@/features/upload/utils/get-photo-location';
import { normalizePhoto } from '@/features/upload/utils/normalize-photo';

// Figma Shutter: 바깥 주황 고리 72, 안쪽 흰 원 사이에 검은 틈
const shutterSize = 72;
const shutterRingWidth = 4;
const shutterGap = 4;
// Figma 촬영: 사진 칸 아래 끝에서 셔터 위까지 52
const shutterTopGap = 52;

/**
 * ② 기록 탭: 남기기 1/3 촬영.
 * 갤러리는 일부러 막는다. 그 자리에서 앱 카메라로 찍은 사진만 남길 수 있어야 '가야 보이는' 지도가 된다.
 * 그래서 카메라 권한만 받고, 갤러리(사진 보관함) 권한은 받지 않는다.
 * 찍은 사진은 세로 3:4, 1080×1440으로 맞춘 뒤 draft에 넣어 다음 단계에서 보여준다.
 * 셔터를 누른 순간의 위치도 같이 잡는다. 위치는 몇 초 걸릴 수 있어서 기다리지 않고 다음 화면으로 넘어간 뒤 채운다.
 * 앞 카메라로 얼굴을 찍지 않도록 뒤 카메라만 쓴다 (앞뒤 전환 버튼은 팀에서 빼기로 함).
 */
export function CameraScreen() {
  const { updateDraft } = useUploadDraft();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [isReady, setIsReady] = useState(false);
  const [isTaking, setIsTaking] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  // 같은 순간에 두 번 누르면 state는 아직 바뀌기 전이라 둘 다 통과한다. 그래서 바로 바뀌는 ref로 막는다.
  const isTakingRef = useRef(false);

  const askPermission = () => {
    // 한 번 거절해서 다시 물을 수 없으면 시스템 창이 뜨지 않으므로 설정 화면으로 보낸다.
    if (permission && !permission.canAskAgain) Linking.openSettings();
    else requestPermission();
  };

  // 셔터를 누른 순간의 위치와, 위치 확인 화면에 보여줄 동네 이름(지도 담당의 카카오 동네 이름 함수)을 채운다
  const recordPhotoLocation = async () => {
    const location = await getPhotoLocation();
    updateDraft({ location: location ?? undefined });
    if (!location) return;
    const regionName = await getRegionName({ latitude: location.lat, longitude: location.lng }).catch(() => '');
    if (regionName) updateDraft({ placeLabel: regionName });
  };

  const takePhoto = async () => {
    // 카메라가 준비되기 전에 찍으면 실패하고, 두 번 누르면 두 장이 찍혀서 막는다.
    if (!cameraRef.current || !isReady || isTakingRef.current) return;
    recordPhotoLocation();
    isTakingRef.current = true;
    setIsTaking(true);
    setHasFailed(false);
    try {
      // 몰래 찍는 것처럼 보이지 않게 셔터 소리를 켠다 (팀 결정)
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, shutterSound: true });
      const photoUri = await normalizePhoto(photo);
      // 한 줄 남기기에서 뒤로 와 다시 찍으면 다른 자리·다른 순간일 수 있어서, 앞 사진에 쓴 글을 모두 비운다 (팀 결정).
      // 얼굴 거절로 돌아올 때와 같다. 질문이 비면 한 줄 남기기에서 새 질문을 받는다.
      updateDraft({ photoUri, questionId: undefined, question: undefined, title: '', oneLine: '', hashtags: [] });
      router.push('/upload/write');
    } catch {
      // 카메라가 잠깐 바쁘거나 전환 중이면 실패한다. 다시 누르면 되므로 안내만 띄운다.
      setHasFailed(true);
    } finally {
      isTakingRef.current = false;
      setIsTaking(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      {/* 검은 배경 위라 시계·배터리를 흰색으로 (Figma 촬영 화면) */}
      <StatusBar style="light" />
      <View style={styles.header}>
        <Pressable accessibilityLabel="뒤로" hitSlop={12} onPress={() => router.back()}>
          <Icon name="back" color="textInverse" />
        </Pressable>
        <AppText variant="subtitle03" color="textInverse" style={styles.headerTitle}>
          촬영
        </AppText>
        <AppText variant="subtitle03" color="textInverse">
          1/3
        </AppText>
      </View>

      <CameraViewfinder
        cameraRef={cameraRef}
        facing="back"
        hasPermission={permission?.granted ?? false}
        onRequestPermission={askPermission}
        onReady={() => setIsReady(true)}
      />

      <View style={styles.controls}>
        {hasFailed && (
          <AppText variant="caption02" color="textInverse" style={styles.failNotice}>
            사진을 찍지 못했어요. 다시 눌러 주세요
          </AppText>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="사진 찍기"
          accessibilityState={{ disabled: !isReady || isTaking }}
          onPress={takePhoto}
          style={styles.shutter}>
          <View style={styles.shutterInner} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.textPrimary,
  },
  // Figma 화면 머리 높이 56 (다른 화면의 ScreenHeader와 같게)
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: screenPaddingX,
  },
  // 좌우 버튼 길이와 상관없이 제목을 정확히 가운데 두려고 겹쳐 놓는다
  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    pointerEvents: 'none',
  },
  // 셔터를 카메라 칸 바로 아래(Figma 간격 52)에 붙여서 사진과 한 덩어리로 보이게 한다.
  // 화면이 긴 폰은 남는 공간이 셔터 아래 검은 부분으로 간다.
  controls: {
    height: shutterSize,
    marginTop: shutterTopGap,
    alignItems: 'center',
    justifyContent: 'center',
  },
  failNotice: {
    position: 'absolute',
    top: shutterSize + spacing.md,
  },
  shutter: {
    width: shutterSize,
    height: shutterSize,
    padding: shutterGap,
    borderRadius: radius.full,
    borderWidth: shutterRingWidth,
    borderColor: colors.shutterRing,
  },
  shutterInner: {
    flex: 1,
    borderRadius: radius.full,
    backgroundColor: colors.background01,
  },
});
