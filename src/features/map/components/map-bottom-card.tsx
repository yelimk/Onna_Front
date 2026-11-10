import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, { LinearTransition, useAnimatedStyle } from 'react-native-reanimated';

import { Icon } from '@/components/icon';
import { colors } from '@/constants/colors';
import { radius, screenPaddingX, spacing } from '@/constants/layout';
import { duration, easeOut } from '@/constants/motion';
import { SheetHandle } from '@/features/map/components/sheet-handle';
import { sheetCornerRadius } from '@/features/map/constants/map-layout';
import { useSheetDrag } from '@/features/map/hooks/use-sheet-drag';

const closeButtonSize = 36;
const cardGap = spacing.md;
/** 카드 내용이 바뀌어(경로를 받는 중 → 받음) 크기가 달라질 때 한 번에 바뀌지 않고 부드럽게 늘고 준다. */
const cardResize = LinearTransition.duration(duration.normal).easing(easeOut);

type CardCollapse = {
  isExpanded: boolean;
  onExpandedChange: (isExpanded: boolean) => void;
  /** 손잡이를 누를 때 읽어 주는 이름 ('경로 정보') */
  label: string;
  /** 접으면 가려지는 아래 부분 (들를 자리, '이 길로 걷기') */
  content: ReactNode;
  /**
   * 접은 카드 바로 위에 서 있는 것 (Figma '경로·장소 정보 UI'의 카메라 버튼).
   * 카드를 끌어도 따라 움직이지 않고 그 자리에 있다. 펼치면 카드가 위로 덮는다.
   */
  floating?: ReactNode;
};

type MapBottomCardProps = {
  /** 지도가 카드에 가리지 않게 맞추려고 카드 높이를 알린다. */
  onLayout: (event: LayoutChangeEvent) => void;
  /** 주면 손잡이를 누르거나 카드를 손가락으로 끌어 접고 펼친다 (경로 카드). 없으면 손잡이는 모양만 둔다. */
  collapse?: CardCollapse;
  /** 늘 보이는 윗부분 (제목, 닫기) */
  children: ReactNode;
};

/** 검색결과에서 한 곳을 골랐을 때 화면 아래에 붙는 흰 카드 (장소·해시태그·경로 카드가 같이 쓴다). */
export function MapBottomCard({ onLayout, collapse, children }: MapBottomCardProps) {
  if (collapse) return <CollapsibleCard onLayout={onLayout} collapse={collapse}>{children}</CollapsibleCard>;
  return (
    <Animated.View layout={cardResize} style={styles.card} onLayout={onLayout}>
      <SheetHandle />
      {children}
    </Animated.View>
  );
}

/**
 * 접고 펼치는 카드. 카드 높이는 그대로 두고 카드를 아래로 밀어 내려 접는다. 끄는 동안 카드가 손가락을 그대로 따라온다.
 * 높이를 줄이면 지도가 가려지는 높이가 바뀌어, 접을 때 지도가 확대되고 펼칠 때 축소됐다. 길안내 시트처럼 지도는 그대로 둔다.
 */
function CollapsibleCard({ onLayout, collapse, children }: Required<Omit<MapBottomCardProps, 'collapse'>> & { collapse: CardCollapse }) {
  const { isExpanded, onExpandedChange, label, content, floating } = collapse;
  // 접을 때 내려가는 거리 = 접히는 부분 높이 + 그 위 간격. 그래야 접었을 때 제목 아래 여백이 펼쳤을 때와 같다.
  const [contentHeight, setContentHeight] = useState(0);
  // 카메라 버튼은 접은 카드 윗변 위에 고정한다 (사용자 결정: 지도 홈 버튼처럼 카드를 따라 움직이지 않음). 카드 밖이라 안드로이드에서도 눌린다.
  const [cardHeight, setCardHeight] = useState(0);
  const slideHeight = contentHeight > 0 ? contentHeight + cardGap : 0;
  const { panHandlers, openAmount } = useSheetDrag({ isExpanded, onExpandedChange, openHeight: slideHeight });

  const slideStyle = useAnimatedStyle(() => ({ transform: [{ translateY: slideHeight - openAmount.get() }] }));
  const contentStyle = useAnimatedStyle(() => ({ opacity: slideHeight > 0 ? openAmount.get() / slideHeight : 1 }));

  return (
    <>
      {/* 카드보다 먼저 그려서, 카드를 펼치면 카드가 이 위를 덮는다. */}
      {floating && (
        <View style={[styles.floating, { bottom: cardHeight - slideHeight + spacing.md }]} pointerEvents="box-none">
          {floating}
        </View>
      )}
      <Animated.View
        style={[styles.card, slideStyle]}
        onLayout={(event) => {
          setCardHeight(Math.round(event.nativeEvent.layout.height));
          onLayout(event);
        }}
        {...panHandlers}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label} ${isExpanded ? '접기' : '펼치기'}`}
          hitSlop={spacing.sm}
          onPress={() => onExpandedChange(!isExpanded)}
          style={styles.handleArea}>
          <SheetHandle />
        </Pressable>
        {children}
        {/* 접어도 늘 그려 둔다. 그래야 끄는 동안 카드와 함께 조금씩 드러난다. 접힌 동안은 누르거나 읽지 않게 한다. */}
        <Animated.View
          style={[styles.collapsible, contentStyle]}
          pointerEvents={isExpanded ? 'auto' : 'none'}
          importantForAccessibility={isExpanded ? 'auto' : 'no-hide-descendants'}
          accessibilityElementsHidden={!isExpanded}
          onLayout={({ nativeEvent }) => setContentHeight(Math.round(nativeEvent.layout.height))}>
          {content}
        </Animated.View>
      </Animated.View>
    </>
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
    gap: cardGap,
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
  collapsible: {
    gap: cardGap,
  },
  floating: {
    position: 'absolute',
    right: screenPaddingX,
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
