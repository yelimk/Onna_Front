import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { Icon } from '@/components/icon';
import { colors } from '@/constants/colors';
import { radius, spacing, toastShadow } from '@/constants/layout';
import { duration, easeIn, easeOut } from '@/constants/motion';

/** 실패(빨간 X), 성공(초록 체크), 아이콘 없는 안내 (Figma 공통 컴포넌트 토스트 3종) */
export type ToastType = 'error' | 'success' | 'plain';

type ToastMessage = { id: number; message: string; type: ToastType };

// Figma 로그인 오류 토스트: 다 나타난 뒤 1.5초 보이다가 사라진다
const visibleMs = duration.toast + 1500;
// 나타날 때 위에서 이만큼 내려오며 떠오른다 (Figma 애니메이션: 상단 토스트 메시지 팝업)
const dropDistance = spacing.md;

// 어느 화면에서든 부를 수 있게 토스트 상태를 화면 밖(모듈)에 하나만 둔다
let nextId = 0;
const listeners = new Set<(toast: ToastMessage) => void>();

/**
 * 화면 위에 잠깐 떴다 사라지는 알림. 알림창(Alert)과 달리 버튼을 누르지 않아도 되는 짧은 결과에 쓴다.
 * 예: showToast('신고가 접수되었습니다', 'success')
 */
export function showToast(message: string, type: ToastType = 'plain') {
  const toast = { id: ++nextId, message, type };
  listeners.forEach((listener) => listener(toast));
}

/** 루트 레이아웃(app/_layout.tsx)에 한 번만 둔다. 가장 최근 토스트 하나만 보여준다. */
export function ToastHost() {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const progress = useSharedValue(0);

  // Figma 로그인 오류: 나타날 때는 Ease out(빠르게 내려와 천천히 멈춤), 사라질 때는 Ease in(천천히 떠나 빠르게 사라짐)
  useEffect(() => {
    progress.set(withTiming(isVisible ? 1 : 0, { duration: duration.toast, easing: isVisible ? easeOut : easeIn }));
  }, [isVisible, progress]);

  const popupStyle = useAnimatedStyle(() => ({
    opacity: progress.get(),
    transform: [{ translateY: interpolate(progress.get(), [0, 1], [-dropDistance, 0]) }],
  }));

  useEffect(() => {
    const listener = (next: ToastMessage) => {
      setToast(next);
      setIsVisible(true);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  // 새 토스트가 오면 시간을 처음부터 다시 잰다 (toast.id가 바뀌므로)
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setIsVisible(false), visibleMs);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  return (
    // Figma 로그인 오류 화면처럼 상태 표시줄 바로 아래에 붙인다
    <View pointerEvents="none" style={[styles.host, { top: insets.top }]}>
      <Animated.View style={[styles.toast, popupStyle]} accessibilityLiveRegion="polite">
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
