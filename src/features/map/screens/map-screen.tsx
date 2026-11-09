import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '@/components/badge';
import { screenPaddingX, spacing } from '@/constants/layout';
import { AiBadge } from '@/features/map/components/ai-badge';
import { ExploreModeToggle } from '@/features/map/components/explore-mode-toggle';
import { ExploreSheet } from '@/features/map/components/explore-sheet';
import { LocationPermissionCard } from '@/features/map/components/location-permission-card';
import { MapActionButtons } from '@/features/map/components/map-action-buttons';
import { MapSearchBar } from '@/features/map/components/map-search-bar';
import { SelectedResultCard } from '@/features/map/components/selected-result-card';
import { openRadiusMeters } from '@/features/map/constants/map-config';
import { mapChromeFadeMs } from '@/features/map/constants/map-motion';
import { useHomeMapMarkers } from '@/features/map/hooks/use-home-map-markers';
import { useHomeRoutes } from '@/features/map/hooks/use-home-routes';
import { refreshZones, setZonesCenter } from '@/features/map/hooks/use-map-zones';
import { useMyLocation } from '@/features/map/hooks/use-my-location';
import { useMyMapPosts } from '@/features/map/hooks/use-my-map-posts';
import { KakaoMapView } from '@/features/map/kakao-map/kakao-map-view';
import type { MapMarker } from '@/features/map/types/home-map-marker';
import { getZonesNotice } from '@/features/map/utils/get-zones-notice';
import { openRecord } from '@/features/map/utils/open-search-result';
import { useFadeStyle } from '@/hooks/use-fade-style';

function openMarker(marker: MapMarker) {
  if (marker.kind === 'cluster') router.push(`/map/cluster/${marker.id}`);
  else if (marker.kind === 'photo') openRecord(marker.id);
}

/**
 * Figma '지도 홈 화면 UI'. 카카오맵 위에 사진 마커, 검색창, 탐색 모드 스위치, 남기기 버튼을 올린다.
 * 탐색 모드를 켜면 내 위치 둘레에 열림 반경을 그리고, 아래 패널에서 가장 가까운 기록을 보여준다.
 * 해시태그 검색에서 넘겨받은 장소의 경로 추천과 '산책 경로 추천' 버튼의 AI 추천 경로는 useHomeRoutes가 다룬다.
 * 내가 남긴 기록은 지도 구역에 들어 있지 않아서(남의 사진만 옴) 따로 받아 함께 올린다.
 * 위치 권한이 없으면 지도 위에 권한 안내를 덮는다.
 * 검색창을 누르면 Figma '지도 홈 화면 애니메이션'처럼 검색창·탐색 모드만 남기고 나머지를 흐리게 지운 뒤 검색 창을 띄운다.
 */
export function MapScreen() {
  const insets = useSafeAreaInsets();
  const { isChecking, isGranted, location, request } = useMyLocation();
  const { markers, nearestPhoto, errorCode } = useHomeMapMarkers(location);
  const zonesNotice = getZonesNotice(errorCode);
  const myPostMarkers = useMyMapPosts();
  const [isExploring, setIsExploring] = useState(false);
  // 탐색 모드를 켜면 바로 가장 가까운 기록이 보이도록 펼친 상태로 시작한다.
  const [isSheetExpanded, setIsSheetExpanded] = useState(true);
  const [isBrowsing, setIsBrowsing] = useState(false);
  const [isOpeningSearch, setIsOpeningSearch] = useState(false);
  const chromeStyle = useFadeStyle(!isOpeningSearch, mapChromeFadeMs);

  // 지도 홈으로 돌아오면 검색을 열 때 지웠던 버튼과 이름표를 다시 보여주고, 그사이 남겨진 새 기록이 보이게 구역을 새로 받는다.
  useFocusEffect(
    useCallback(() => {
      setIsOpeningSearch(false);
      refreshZones();
    }, []),
  );

  const routes = useHomeRoutes(location);

  // 오른쪽 '내 위치' 버튼을 누를 때마다 번호를 올려, 지도가 내 위치로 돌아오게 한다 (다른 곳을 둘러보다가 돌아올 때).
  const [recenterRequest, setRecenterRequest] = useState(0);
  const moveToMyLocation = () => setRecenterRequest((count) => count + 1);

  const openSearch = () => {
    // 검색에서 장소를 골라 돌아오면 그 장소 경로를 보므로, 보고 있던 AI 추천 경로는 닫는다.
    routes.closeAiRoute();
    setIsOpeningSearch(true);
    router.push('/map/search');
  };
  // 남의 기록(구역)에 내 기록을 더하고, 고른 장소가 있으면 그 핀을 위에 더한다.
  const mapMarkers = useMemo<MapMarker[]>(
    () => [...markers, ...myPostMarkers, ...routes.placeMarkers],
    [markers, myPostMarkers, routes.placeMarkers],
  );

  const showPermissionCard = !isChecking && !isGranted && !isBrowsing;
  const isRecordVisible = isExploring && isSheetExpanded;

  const changeExploring = (next: boolean) => {
    setIsExploring(next);
    if (next) setIsSheetExpanded(true);
  };

  return (
    <View style={styles.screen}>
      <KakaoMapView
        markers={mapMarkers}
        myLocation={location}
        openRadiusMeters={isExploring ? openRadiusMeters : null}
        focus={routes.focus}
        routePath={routes.routePath}
        isQuiet={isOpeningSearch}
        onMarkerPress={openMarker}
        recenterRequest={recenterRequest}
        onCenterChange={setZonesCenter}
      />

      <View style={[styles.top, { paddingTop: insets.top + spacing.xs }]}>
        <MapSearchBar onPress={openSearch} />
        <View style={styles.toggle}>
          <ExploreModeToggle value={isExploring} onChange={changeExploring} />
        </View>
        {zonesNotice && <Badge label={zonesNotice} tone="dark" style={styles.notice} />}
        {routes.isAiRouteShown && (
          <Animated.View style={chromeStyle}>
            <AiBadge label="AI 추천 경로" />
          </Animated.View>
        )}
      </View>

      <Animated.View style={[styles.chrome, chromeStyle]}>
        {routes.card ? (
          <SelectedResultCard
            state={routes.card}
            cardHeight={routes.cardHeight}
            onLayout={({ nativeEvent }) => routes.setCardHeight(Math.round(nativeEvent.layout.height))}
            onClose={routes.closeCard}
            onRecommend={routes.recommendRoute}
            onRouteExpandedChange={routes.setIsRouteExpanded}
            onWalk={routes.walkThisRoute}
          />
        ) : (
          <View style={[styles.bottom, isExploring && styles.bottomWithSheet]}>
            <View style={styles.actions}>
              <MapActionButtons
                onMyLocationPress={moveToMyLocation}
                onRoutePress={routes.openAiRoute}
                showCamera={!isRecordVisible}
              />
            </View>
            {isExploring && (
              <ExploreSheet
                nearestPhoto={nearestPhoto}
                isExpanded={isSheetExpanded}
                onExpandedChange={setIsSheetExpanded}
              />
            )}
          </View>
        )}
      </Animated.View>

      {showPermissionCard && <LocationPermissionCard onRequest={request} onBrowse={() => setIsBrowsing(true)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  // 지도를 끌 수 있도록 검색창·버튼이 없는 빈 곳의 터치는 아래 지도로 넘긴다.
  top: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: screenPaddingX,
    gap: spacing.sm,
    pointerEvents: 'box-none',
  },
  // 아래쪽 버튼·패널을 한 번에 흐리게 하려고 덮는 층. 빈 곳의 터치는 지도로 넘긴다.
  chrome: {
    ...StyleSheet.absoluteFill,
    pointerEvents: 'box-none',
  },
  toggle: {
    alignSelf: 'flex-end',
  },
  notice: {
    alignSelf: 'center',
  },
  // Figma 지도 홈(위치 관련 추가사항): 카메라 버튼 아래 끝이 탭 바에서 24 떨어져 있다 (Figma 코드의 bottom 110은 탭 바 높이를 포함한 값).
  bottom: {
    position: 'absolute',
    left: screenPaddingX,
    right: screenPaddingX,
    bottom: spacing.xl,
    gap: spacing.md,
    pointerEvents: 'box-none',
  },
  // Figma에서 패널은 탭 바 바로 위에 붙어 있다.
  bottomWithSheet: {
    bottom: spacing.xs,
  },
  actions: {
    alignSelf: 'flex-end',
  },
});
