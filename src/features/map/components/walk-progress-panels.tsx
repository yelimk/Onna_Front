import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { PhotoPlaceholder } from '@/components/photo-placeholder';
import { colors } from '@/constants/colors';
import { floatingShadow, radius, spacing } from '@/constants/layout';
import type { WalkStop } from '@/features/map/constants/preview-walk-route';

type WalkStatusCardProps = {
  routeTitle: string;
  stopCount: number;
  nextStopIndex: number;
  minutesToNext: number;
  metersToNext: number;
};

/** 걷는 중 화면 위쪽: 다음 자리까지 남은 시간과 구간별 진행 막대 */
export function WalkStatusCard({ routeTitle, stopCount, nextStopIndex, minutesToNext, metersToNext }: WalkStatusCardProps) {
  return (
    <View style={styles.statusCard}>
      <View style={styles.statusHeader}>
        <AppText variant="subtitle02" color="textInverse">
          다음 자리까지 {minutesToNext}분
        </AppText>
        <AppText variant="caption04" color="textInverse">
          {nextStopIndex + 1} / {stopCount} · 약 {metersToNext}m
        </AppText>
      </View>
      <View style={styles.segments}>
        {Array.from({ length: stopCount }, (_, index) => (
          <View
            key={index}
            style={[
              styles.segment,
              index < nextStopIndex && styles.segmentDone,
              index === nextStopIndex && styles.segmentCurrent,
            ]}
          />
        ))}
      </View>
      <AppText variant="caption04" color="textInverse">
        {routeTitle}
      </AppText>
    </View>
  );
}

type NextStopCardProps = {
  stop: WalkStop;
  blurLevel: number;
  onStop: () => void;
};

/**
 * 걷는 중 화면 아래쪽: 다음 자리 미리보기와 그만 걷기.
 * '자세히'·'(시연) 도착 근처'는 지운 와이어프레임 자리 상세(/map/spot)로 가던 버튼이라 뺐다.
 */
export function NextStopCard({ stop, blurLevel, onStop }: NextStopCardProps) {
  return (
    <View style={styles.nextCard}>
      <View style={styles.nextRow}>
        <PhotoPlaceholder width={56} height={56} />
        <View style={styles.nextTexts}>
          <AppText variant="caption04" color="textTertiary">
            다음 자리 · 흐림 {blurLevel}단계
          </AppText>
          <AppText variant="subtitle04">{stop.hashtags.join(' ')}</AppText>
        </View>
      </View>
      <Button label="그만 걷기" variant="outline" onPress={onStop} />
    </View>
  );
}

const styles = StyleSheet.create({
  statusCard: {
    ...floatingShadow,
    alignSelf: 'stretch',
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.textPrimary,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  segments: {
    flexDirection: 'row',
    gap: spacing.xxs,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.textSecondary,
  },
  segmentDone: {
    backgroundColor: colors.primary,
  },
  segmentCurrent: {
    backgroundColor: colors.primary,
    opacity: 0.5,
  },
  nextCard: {
    ...floatingShadow,
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.background01,
  },
  nextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  nextTexts: {
    flex: 1,
    gap: spacing.xxs,
  },
});
