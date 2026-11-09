import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { screenPaddingX, spacing } from '@/constants/layout';
import { CameraButton } from '@/features/map/components/map-action-buttons';
import { NavigationBanner } from '@/features/map/components/navigation-banner';
import { PhotoUnlockOverlay } from '@/features/map/components/photo-unlock-overlay';
import { RecordsInRangeSheet } from '@/features/map/components/records-in-range-sheet';
import { SlidingPanel } from '@/features/map/components/sliding-panel';
import { openRadiusMeters } from '@/features/map/constants/map-config';
import { useLocationAccuracy, useMyLocation } from '@/features/map/hooks/use-my-location';
import { openNearbyPost, useOpenedPost } from '@/features/map/hooks/use-opened-posts';
import { useWalkNavigation } from '@/features/map/hooks/use-walk-navigation';
import { KakaoMapView } from '@/features/map/kakao-map/kakao-map-view';
import type { MapMarker } from '@/features/map/types/home-map-marker';
import { openRecord } from '@/features/map/utils/open-search-result';

/** 펼친 목록은 화면의 이만큼을 차지한다. */
const expandedSheetRatio = 0.4;
/** 접었을 때 남는 손잡이와 제목 높이 */
const collapsedSheetHeight = 84;
/** 위쪽 안내 띠 높이. 지도를 맞출 때 띠에 가리지 않게 비운다. */
const bannerHeight = 64;

function getBannerMessage(progress: ReturnType<typeof useWalkNavigation>['progress']) {
  if (!progress) return '경로를 찾는 중이에요';
  if (progress.hasArrived) return '목적지에 도착했어요';
  return `${progress.isHeadingToDestination ? '목적지' : '다음 자리'}까지 ${progress.minutesToTarget}분`;
}

/**
 * Figma '지도 길안내 UI', '지도 목적지 도착 및 사진 해금 UI'. '이 길로 걷기'를 누르면 온다.
 * 지도에는 걸어온 길(회색)과 남은 길(주황), 내 열림 반경, 목적지를 그리고,
 * 위쪽 띠에 다음 자리까지 남은 시간을, 아래 패널에 열림 반경 안의 기록('범위 내 기록들')을 보여준다.
 * 목적지에 닿으면 패널을 아래로 내려 보내고(Figma '지도 경로 탐색 애니메이션'), 그 자리의 기록이 열렸다는 화면('열렸어요')을 띄운다.
 */
export function NavigationScreen() {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { location } = useMyLocation();
  const navigation = useWalkNavigation(location);
  const [isSheetExpanded, setIsSheetExpanded] = useState(true);
  const [isUnlockDismissed, setIsUnlockDismissed] = useState(false);
  const hasArrived = navigation.progress?.hasArrived ?? false;
  const unlockedRecordId = navigation.unlockedRecord?.id;

  const accuracy = useLocationAccuracy();
  const { opened } = useOpenedPost(unlockedRecordId ?? '');

  // 도착하면 그 자리의 기록을 서버에 열어 달라고 한다. 연 사진을 '열렸어요' 화면과 사진 카드가 같이 쓴다.
  useEffect(() => {
    if (unlockedRecordId && location) openNearbyPost(unlockedRecordId, location, accuracy);
  }, [unlockedRecordId, location, accuracy]);

  // '길안내 종료': 길안내를 시작한 화면(검색결과의 경로 카드, 지도 홈의 경로 카드)으로 돌아간다 (QA: 지도 홈까지 한 번에 가지 않게).
  // 앱을 다시 켜 길안내만 남아 돌아갈 곳이 없으면 지도 홈으로 간다.
  const endNavigation = () => (router.canGoBack() ? router.back() : router.dismissTo('/map'));

  const sheetHeight = Math.round(windowHeight * expandedSheetRatio);
  // Figma '목적지 도착 UI'에는 아래 패널이 없다.
  const bottomInset = hasArrived ? 0 : isSheetExpanded ? sheetHeight : collapsedSheetHeight;

  const markers = useMemo<MapMarker[]>(
    () =>
      navigation.destination
        ? [{ kind: 'pin', id: 'destination', coordinate: navigation.destination, label: navigation.destinationName }]
        : [],
    [navigation.destination, navigation.destinationName],
  );
  // 경로를 받으면 한 번 전체 경로가 보이게 맞춘다. 걷는 동안 계속 맞추면 지도를 둘러볼 수 없다.
  const focus = useMemo(
    () =>
      navigation.fullPath
        ? {
            coordinates: navigation.fullPath,
            padding: { top: bannerHeight + spacing.xl, right: spacing.xl, bottom: bottomInset + spacing.xl, left: spacing.xl },
          }
        : undefined,
    [navigation.fullPath, bottomInset],
  );

  return (
    <View style={styles.screen}>
      <KakaoMapView
        markers={markers}
        myLocation={location}
        openRadiusMeters={openRadiusMeters}
        focus={focus}
        routePath={navigation.progress?.remainingPath ?? navigation.fullPath}
        walkedPath={navigation.progress?.walkedPath ?? null}
        // 목적지가 기록이면(AI 추천 경로의 마지막 자리) 핀을 눌러 그 사진 카드를 띄운다. 구역 밖 기록도 여기서 열 수 있다.
        onMarkerPress={() => {
          if (navigation.destinationRecordId) openRecord(navigation.destinationRecordId);
        }}
      />

      <View style={[styles.banner, { top: insets.top + spacing.xs }]}>
        <NavigationBanner message={getBannerMessage(navigation.progress)} onEnd={endNavigation} />
      </View>

      {!hasArrived && (
        <SlidingPanel>
          {/* Figma: 목록을 접으면 카메라 버튼이 목록 위에 나온다. */}
          {!isSheetExpanded && (
            <View style={[styles.camera, { bottom: collapsedSheetHeight + spacing.md }]}>
              <CameraButton />
            </View>
          )}
          <RecordsInRangeSheet
            height={sheetHeight}
            records={navigation.recordsInRange}
            isExpanded={isSheetExpanded}
            onExpandedChange={setIsSheetExpanded}
            onPressRecord={(record) => openRecord(record.id)}
          />
        </SlidingPanel>
      )}

      {/* 서버가 실제로 열어 준 뒤에만 '열렸어요'를 띄운다. 도착 판정은 앱이 하지만, 열지는 서버가 정한다. */}
      {navigation.unlockedRecord && opened && !isUnlockDismissed && (
        <PhotoUnlockOverlay
          imageUrl={opened.imageUrl}
          onOpen={() => {
            // 해금 화면은 Modal이라 닫지 않고 넘어가면 다음 화면 위에 남는다.
            setIsUnlockDismissed(true);
            if (unlockedRecordId) openRecord(unlockedRecordId);
          }}
          onDismiss={() => setIsUnlockDismissed(true)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  banner: {
    position: 'absolute',
    left: screenPaddingX,
    right: screenPaddingX,
  },
  camera: {
    position: 'absolute',
    right: screenPaddingX,
  },
});
