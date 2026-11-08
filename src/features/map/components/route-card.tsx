import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/layout';
import { CardCloseButton, MapBottomCard } from '@/features/map/components/map-bottom-card';
import type { PhotoMarker } from '@/features/map/types/home-map-marker';

const stopNumberSize = 20;

type RouteCardProps = {
  /** 목적지 이름(검색 경로) 또는 경로 이름(지도 홈 AI 추천 경로) */
  title: string;
  /** 제목 아래 한 줄 (주소·거리 등). 비면 줄을 두지 않는다. */
  details: string;
  stops: PhotoMarker[];
  /** 들를 자리 아래 안내 문구 */
  message: string;
  /** 걸어갈 곳이 없으면(지도 홈 AI 경로에 들를 자리가 없음) '이 길로 걷기'를 막는다. */
  canWalk?: boolean;
  isLoading: boolean;
  isExpanded: boolean;
  onExpandedChange: (isExpanded: boolean) => void;
  onClose: () => void;
  onWalk: () => void;
  onLayout: (event: LayoutChangeEvent) => void;
};

/**
 * Figma '지도 장소 선택 시 경로 추천 UI (화면 축소 버전)'의 아래 카드.
 * 펼치면 '경로 정보 UI'(들르는 자리와 '이 길로 걷기'), 접으면 '경로·장소 정보 UI'(목적지 이름만)다.
 * 지도 홈의 AI 추천 경로도 Figma에 따로 그린 카드가 없어서 같은 카드를 쓴다.
 */
export function RouteCard({
  title,
  details,
  stops,
  message,
  canWalk = true,
  isLoading,
  isExpanded,
  onExpandedChange,
  onClose,
  onWalk,
  onLayout,
}: RouteCardProps) {
  return (
    <MapBottomCard onLayout={onLayout} collapse={{ isExpanded, onExpandedChange, label: '경로 정보' }}>
      <View style={styles.summary}>
        <View style={styles.texts}>
          <AppText variant="heading03" numberOfLines={1}>
            {title}
          </AppText>
          {details.length > 0 && (
            <AppText variant="caption01" color="textTertiary" numberOfLines={1}>
              {details}
            </AppText>
          )}
        </View>
        <CardCloseButton onPress={onClose} label="경로 닫기" />
      </View>

      {isExpanded && (
        <>
          <View style={styles.divider} />
          {stops.map((stop, index) => (
            <View key={stop.id} style={styles.stop}>
              <View style={styles.stopNumber}>
                <AppText variant="caption03" color="textInverse">
                  {index + 1}
                </AppText>
              </View>
              <View style={styles.stopHashtags}>
                {stop.hashtags.map((hashtag) => (
                  <AppText key={hashtag} variant="button03">
                    {hashtag}
                  </AppText>
                ))}
              </View>
            </View>
          ))}
          <AppText variant="caption01" color="textDeactivated">
            {message}
          </AppText>
          <Button
            label={isLoading ? '경로를 찾는 중' : '이 길로 걷기'}
            variant="primary"
            disabled={isLoading || !canWalk}
            onPress={onWalk}
          />
        </>
      )}
    </MapBottomCard>
  );
}

const styles = StyleSheet.create({
  summary: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  texts: {
    flex: 1,
    gap: spacing.xxs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderDeactivated,
  },
  stop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  stopNumber: {
    width: stopNumberSize,
    height: stopNumberSize,
    borderRadius: radius.xs / 2,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopHashtags: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: spacing.xs,
  },
});
