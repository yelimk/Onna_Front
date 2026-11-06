import { useEffect, useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { AppText } from '@/components/app-text';
import { PressHighlight } from '@/components/press-highlight';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/layout';
import { duration } from '@/constants/motion';
import { useTransitionProgress } from '@/hooks/use-transition-progress';

type DeleteConfirmDialogProps = {
  visible: boolean;
  onCancel: () => void;
  onDelete: () => void;
};

// Figma 삭제 확인 창의 '취소 | 삭제' 버튼 줄 높이 (사이 세로선도 이 높이)
const actionHeight = 40;
// Figma 삭제 확인 창 너비. 글 길이에 따라 창 크기가 바뀌지 않게 고정한다
const dialogWidth = 240;
// Figma 창 안 선 두께 (기록 목록 선과 같은 0.5)
const lineWidth = 0.5;

/**
 * 내 기록 삭제 전에 한 번 묻는 창 (Figma 기록 상세 > 삭제). 지운 기록은 되돌릴 수 없어서 꼭 묻는다.
 * 창은 180ms 동안 서서히 나타나고 사라진다 (Figma 프로토타입: 디졸브 180ms, Ease out).
 * Modal의 기본 서서히 나타나기는 시간을 바꿀 수 없어서, Modal은 바로 띄우고 안쪽을 직접 서서히 바꾼다.
 */
export function DeleteConfirmDialog({ visible, onCancel, onDelete }: DeleteConfirmDialogProps) {
  const progress = useTransitionProgress(visible, duration.change);
  const fadeStyle = useAnimatedStyle(() => ({ opacity: progress.get() }));
  // 닫을 때 사라지는 움직임이 끝날 때까지 Modal을 남겨 둔다
  const [isMounted, setIsMounted] = useState(visible);
  // 열 때는 그리는 중에 바로 띄운다 (React 권장: 받은 값이 바뀌면 그리는 중에 상태를 맞춘다)
  if (visible && !isMounted) setIsMounted(true);

  useEffect(() => {
    if (visible) return;
    const timer = setTimeout(() => setIsMounted(false), duration.change);
    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <Modal visible={isMounted} transparent animationType="none" onRequestClose={onCancel}>
      <Animated.View style={[styles.dim, fadeStyle]}>
        <View style={styles.dialog}>
          <View style={styles.texts}>
            <AppText variant="subtitle03" style={styles.center}>
              삭제하시겠습니까?
            </AppText>
            <AppText variant="caption02" color="textTertiary" style={styles.center}>
              삭제한 기록은 다시 복구할 수 없어요
            </AppText>
          </View>
          {/* Figma: 누르고 있으면 버튼 칸에 옅은 회색이 100ms 동안 깔린다 */}
          <View style={styles.actions}>
            <PressHighlight accessibilityRole="button" onPress={onCancel} disabled={!visible} style={styles.action}>
              <AppText variant="button04" color="textDeactivated">
                취소
              </AppText>
            </PressHighlight>
            <View style={styles.actionDivider} />
            <PressHighlight accessibilityRole="button" onPress={onDelete} disabled={!visible} style={styles.action}>
              <AppText variant="button04" color="error">
                삭제
              </AppText>
            </PressHighlight>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  dim: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dialogDim,
  },
  dialog: {
    width: dialogWidth,
    borderRadius: radius.lg,
    backgroundColor: colors.background01,
    overflow: 'hidden',
  },
  texts: {
    gap: spacing.xxs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  center: {
    textAlign: 'center',
  },
  actions: {
    height: actionHeight,
    flexDirection: 'row',
    borderTopWidth: lineWidth,
    borderTopColor: colors.borderDeactivated,
  },
  action: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionDivider: {
    width: lineWidth,
    backgroundColor: colors.borderDeactivated,
  },
});
