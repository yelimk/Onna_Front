import { useEffect, useMemo } from 'react';
import { PanResponder } from 'react-native';
import { cancelAnimation, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { spacing } from '@/constants/layout';
import { duration, easeOut } from '@/constants/motion';

/** 손가락을 뗄 때 빠르기(px/ms)가 이보다 크면, 반을 못 밀었어도 민 쪽으로 펼치거나 접는다 (휙 밀기). */
const flingVelocity = 0.5;
/** 손을 뗀 뒤 끝까지 가는 움직임. 다른 패널과 같은 길이·곡선이다. */
const settleAnimation = { duration: duration.normal, easing: easeOut };

type SheetDragOptions = {
  isExpanded: boolean;
  onExpandedChange: (isExpanded: boolean) => void;
  /** 펼쳤을 때 접히는 부분(내용)의 높이(px). 접으면 0이 된다. */
  openHeight: number;
};

/**
 * 아래 시트를 손가락으로 끌어 펼치고 접는다. 시트의 접히는 부분 높이가 손가락을 그대로 따라오고,
 * 손을 떼면 반 넘게 열렸는지(또는 휙 민 방향)로 끝까지 펼치거나 접는다.
 * 손잡이를 누르는 등 밖에서 isExpanded를 바꿔도 같은 움직임으로 따라간다.
 * - panHandlers: 끌 수 있는 곳(손잡이·제목)에 펼쳐 넣는다
 * - contentStyle: 접히는 부분을 감싼 Animated.View에 넣는다 (overflow: 'hidden'과 같이)
 * 앱 최상단에 제스처 라이브러리 설정이 없어서, React Native 기본 PanResponder로 손가락을 받는다.
 */
export function useSheetDrag({ isExpanded, onExpandedChange, openHeight }: SheetDragOptions) {
  const contentHeight = useSharedValue(isExpanded ? openHeight : 0);
  /** 손가락을 대는 순간의 높이. 끄는 동안 이 값에서 손가락이 움직인 만큼 더하고 뺀다. */
  const dragStartHeight = useSharedValue(0);

  useEffect(() => {
    contentHeight.set(withTiming(isExpanded ? openHeight : 0, settleAnimation));
  }, [isExpanded, openHeight, contentHeight]);

  // 펼침 상태·펼칠 높이가 바뀔 때만 새로 만든다. 둘 다 손을 뗀 뒤나 처음 잴 때만 바뀌어서 끄는 도중에 바뀌지 않는다.
  const panHandlers = useMemo(() => {
    const clampHeight = (height: number) => Math.min(openHeight, Math.max(0, height));
    const settle = (dy: number, vy: number) => {
      const height = clampHeight(dragStartHeight.get() - dy);
      const next = vy < -flingVelocity ? true : vy > flingVelocity ? false : height > openHeight / 2;
      contentHeight.set(withTiming(next ? openHeight : 0, settleAnimation));
      if (next !== isExpanded) onExpandedChange(next);
    };
    return PanResponder.create({
      // 살짝 건드리거나 옆으로 민 것은 손잡이 누르기·지도 끌기로 남겨 둔다.
      onMoveShouldSetPanResponder: (_, { dx, dy }) => Math.abs(dy) > spacing.xs && Math.abs(dy) > Math.abs(dx),
      onPanResponderGrant: () => {
        cancelAnimation(contentHeight);
        dragStartHeight.set(contentHeight.get());
      },
      // 위로 밀면(dy < 0) 열리고, 아래로 내리면 닫힌다.
      onPanResponderMove: (_, { dy }) => contentHeight.set(clampHeight(dragStartHeight.get() - dy)),
      onPanResponderRelease: (_, { dy, vy }) => settle(dy, vy),
      onPanResponderTerminate: (_, { dy, vy }) => settle(dy, vy),
    }).panHandlers;
  }, [contentHeight, dragStartHeight, isExpanded, onExpandedChange, openHeight]);

  const contentStyle = useAnimatedStyle(() => ({ height: contentHeight.get() }));

  return { panHandlers, contentStyle };
}
