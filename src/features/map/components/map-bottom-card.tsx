import type { ReactNode } from 'react';
import { Pressable, StyleSheet, type LayoutChangeEvent } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';

import { Icon } from '@/components/icon';
import { colors } from '@/constants/colors';
import { radius, screenPaddingX, spacing } from '@/constants/layout';
import { duration, easeOut } from '@/constants/motion';
import { SheetHandle } from '@/features/map/components/sheet-handle';
import { sheetCornerRadius } from '@/features/map/constants/map-layout';
import { useVerticalSwipe } from '@/features/map/hooks/use-vertical-swipe';

const closeButtonSize = 36;
/**
 * 경로 카드를 접고 펼칠 때 카드 크기가 한 번에 바뀌지 않고 부드럽게 늘고 준다.
 * 카드 안 내용(들를 자리 목록)은 펼침 상태에 따라 그리거나 빼서, 손가락을 따라오게 하지 않고 크기 변화만 움직인다.
 */
const cardResize = LinearTransition.duration(duration.normal).easing(easeOut);

type MapBottomCardProps = {
  /** 지도가 카드에 가리지 않게 맞추려고 카드 높이를 알린다. */
  onLayout: (event: LayoutChangeEvent) => void;
  /**
   * 주면 손잡이를 누르거나 위아래로 밀어 카드를 접고 펼친다 (경로 카드).
   * 없으면 손잡이는 모양만 둔다.
   */
  collapse?: { isExpanded: boolean; onExpandedChange: (isExpanded: boolean) => void; label: string };
  children: ReactNode;
};

const noop = () => {};

/** 검색결과에서 한 곳을 골랐을 때 화면 아래에 붙는 흰 카드 (장소·해시태그·경로 카드가 같이 쓴다). */
export function MapBottomCard({ onLayout, collapse, children }: MapBottomCardProps) {
  const swipeHandlers = useVerticalSwipe(collapse?.onExpandedChange ?? noop);

  return (
    <Animated.View layout={cardResize} style={styles.card} onLayout={onLayout} {...(collapse ? swipeHandlers : {})}>
      {collapse ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${collapse.label} ${collapse.isExpanded ? '접기' : '펼치기'}`}
          hitSlop={spacing.sm}
          onPress={() => collapse.onExpandedChange(!collapse.isExpanded)}
          style={styles.handleArea}>
          <SheetHandle />
        </Pressable>
      ) : (
        <SheetHandle />
      )}
      {children}
    </Animated.View>
  );
}

/** 카드 오른쪽 위의 회색 동그라미 X. */
export function CardCloseButton({ onPress, label = '선택 닫기' }: { onPress: () => void; label?: string }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.close}>
      <Icon name="close" size={20} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // 화면 아래에 붙고, 위쪽 모서리만 크게 둥글린다 (Figma 32).
  card: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    gap: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    paddingHorizontal: screenPaddingX,
    borderTopLeftRadius: sheetCornerRadius,
    borderTopRightRadius: sheetCornerRadius,
    backgroundColor: colors.background01,
    shadowColor: colors.textPrimary,
    shadowOpacity: 0.1,
    shadowRadius: radius.lg,
    shadowOffset: { width: 0, height: -spacing.xxs },
    elevation: 8,
  },
  handleArea: {
    alignItems: 'center',
  },
  close: {
    alignSelf: 'flex-start',
    width: closeButtonSize,
    height: closeButtonSize,
    borderRadius: radius.full,
    backgroundColor: colors.disabledBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
