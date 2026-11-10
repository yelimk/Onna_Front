import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, type EasingFunctionFactory } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { Icon } from '@/components/icon';
import { colors } from '@/constants/colors';
import { radius, spacing, toastShadow } from '@/constants/layout';
import { duration, easeIn, easeOut } from '@/constants/motion';

/** 실패(빨간 X), 성공(초록 체크), 아이콘 없는 안내 (Figma 공통 컴포넌트 토스트 3종) */
export type ToastType = 'error' | 'success' | 'plain';

type ToastMotion = {
  /** 나타나기 시작하는 자리. screenTop: 화면 맨 위 끝, aboveScreen: 화면 위 바깥(토스트가 안 보이는 곳) */
  enterFrom: 'screenTop' | 'aboveScreen';
  enterMs: number;
  enterEasing: EasingFunctionFactory;
  /** 다 나타난 뒤 보여주는 시간 */
  visibleMs: number;
  exitMs: number;
  exitEasing: EasingFunctionFactory;
};

/**
 * Figma 프로토타입의 토스트 움직임 두 가지. 둘 다 위에서 내려와 상태 표시줄 바로 아래에 멈추고, 사라질 때는 화면 위로 올라간다.
 * - standard: 로그인 오류 토스트. 화면 맨 위 끝에서 200ms(Ease out) 내려오고, 1.5초 뒤 200ms(Ease in) 올라간다.
 * - brief: 기록 삭제 뒤 '삭제되었습니다'. 화면 위 바깥에서 180ms 내려오고, 1.2초 뒤 180ms 올라간다 (둘 다 Ease out).
 */
const toastMotions = {
  standard: {
    enterFrom: 'screenTop',
    enterMs: duration.toast,
    enterEasing: easeOut,
    visibleMs: 1500,
    exitMs: duration.toast,
    exitEasing: easeIn,
  },
  brief: {
    enterFrom: 'aboveScreen',
    enterMs: duration.change,
    enterEasing: easeOut,
    visibleMs: 1200,
    exitMs: duration.change,
    exitEasing: easeOut,
  },
} satisfies Record<string, ToastMotion>;

export type ToastMotionName = keyof typeof toastMotions;

/** 토스트가 내려와서 보이다가 올라가 사라질 때까지 걸리는 시간. 토스트를 다 보여 준 뒤 다음 일을 할 때 쓴다 */
export function getToastDurationMs(motion: ToastMotionName = 'standard') {
  const { enterMs, visibleMs, exitMs } = toastMotions[motion];
  return enterMs + visibleMs + exitMs;
}

type ToastMessage = { id: number; message: string; type: ToastType; motion: ToastMotionName };

// 토스트 높이를 재기 전에 쓰는 값 (Figma 토스트 높이 48)
const defaultToastHeight = 48;

// 어느 화면에서든 부를 수 있게 토스트 상태를 화면 밖(모듈)에 둔다
let nextId = 0;
// 토스트 자리(ToastHost)는 루트에 하나 있고, 화면 전체를 덮는 창(남기기)에도 하나 더 둔다.
// 덮는 창은 루트보다 위에 그려져서 루트 토스트가 그 뒤에 가려지기 때문이다.
// 가장 나중에 열린(맨 위) 자리에만 보내서, 지금 보이는 화면 위에 토스트가 한 번만 뜨게 한다.
const listeners: ((toast: ToastMessage) => void)[] = [];

/**
 * 화면 위에 잠깐 떴다 사라지는 알림. 알림창(Alert)과 달리 버튼을 누르지 않아도 되는 짧은 결과에 쓴다.
 * 예: showToast('신고가 접수되었습니다', 'success')
 * 움직임은 Figma에 정해진 두 가지 중 고른다. 따로 정해지지 않은 곳은 standard(로그인 오류)를 쓴다.
 */
export function showToast(message: string, type: ToastType = 'plain', motion: ToastMotionName = 'standard') {
  const toast = { id: ++nextId, message, type, motion };
  listeners.at(-1)?.(toast);
}

/**
 * 토스트가 뜨는 자리. 루트 레이아웃(app/_layout.tsx)과, 루트를 덮는 전체 화면 창(app/upload/_layout.tsx)에 둔다.
 * 가장 최근 토스트 하나만 보여준다.
 */
export function ToastHost() {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [toastHeight, setToastHeight] = useState(defaultToastHeight);
  const offsetY = useSharedValue(0);
  const opacity = useSharedValue(0);
  // 상태 표시줄 바로 아래(멈추는 자리)를 0으로 두고, 그보다 위는 음수다
  const screenTopOffset = -insets.top;
  const aboveScreenOffset = -(insets.top + toastHeight);

  useEffect(() => {
    const listener = (next: ToastMessage) => setToast(next);
    listeners.push(listener);
    return () => {
      listeners.splice(listeners.indexOf(listener), 1);
    };
  }, []);

  // 새 토스트가 오면 시작 자리로 옮긴 뒤 내려오게 하고, 보여줄 시간이 지나면 위로 올려 보낸다 (toast.id가 바뀌면 처음부터)
  useEffect(() => {
    if (!toast) return;
    const motion = toastMotions[toast.motion];
    offsetY.set(motion.enterFrom === 'screenTop' ? screenTopOffset : aboveScreenOffset);
    opacity.set(0);
    const enter = { duration: motion.enterMs, easing: motion.enterEasing };
    offsetY.set(withTiming(0, enter));
    opacity.set(withTiming(1, enter));

    const timer = setTimeout(() => {
      const exit = { duration: motion.exitMs, easing: motion.exitEasing };
      offsetY.set(withTiming(aboveScreenOffset, exit));
      opacity.set(withTiming(0, exit));
    }, motion.enterMs + motion.visibleMs);
    return () => clearTimeout(timer);
    // 토스트가 바뀔 때만 다시 움직인다. 화면 크기 값이 바뀌었다고 다시 내려오면 안 된다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  const popupStyle = useAnimatedStyle(() => ({
    opacity: opacity.get(),
    transform: [{ translateY: offsetY.get() }],
  }));

  if (!toast) return null;

  return (
    // Figma 토스트는 상태 표시줄 바로 아래에 멈춘다
    <View pointerEvents="none" style={[styles.host, { top: insets.top }]}>
      <Animated.View
        style={[styles.toast, popupStyle]}
        accessibilityLiveRegion="polite"
        onLayout={(event) => setToastHeight(event.nativeEvent.layout.height)}>
        {toast.type === 'error' && <Icon name="toastError" />}
        {toast.type === 'success' && <Icon name="toastSuccess" />}
        <AppText variant="subtitle03" color="textInverse">
          {toast.message}
        </AppText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
  },
  toast: {
    ...toastShadow,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.toastBackground,
  },
});
