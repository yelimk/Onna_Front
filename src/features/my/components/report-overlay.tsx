import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { colors } from '@/constants/colors';
import { duration } from '@/constants/motion';
// 지도 사진 카드의 신고 창을 그대로 쓴다 (Figma 주석: '신고 버튼 상호작용은 홈화면 플로우 참고').
// 두 기능이 같이 쓰게 됐으니 src/components로 옮기는 게 맞지만, 지도 담당 파일이라 코드 정리 때 같이 옮긴다.
import { ReportSheet } from '@/features/map/components/report-sheet';
import type { ReportReasonId } from '@/features/map/constants/report-reasons';
import { useTransitionProgress } from '@/hooks/use-transition-progress';

type ReportOverlayProps = {
  visible: boolean;
  onClose: () => void;
  /** 서버로 보내는 동안 기다리게 Promise를 돌려준다. 실패하면 신고 창이 그대로 남는다 */
  onSubmit: (reason: ReportReasonId) => void | Promise<void>;
};

/**
 * 좋아요 상세의 신고 창. 화면을 어둡게 덮고 아래에서 지도와 같은 신고 창을 올린다.
 * 어두운 덮개는 기록 삭제 확인 창과 같은 색·움직임이다 (180ms 동안 서서히, Figma 디졸브 180ms).
 * 지도에서는 사진 카드가 이미 어두운 배경 위에 있어서 덮개가 따로 없지만, 좋아요 상세는 흰 화면이라 덮는다.
 * 어두운 곳을 누르거나 X를 누르면 닫힌다.
 */
export function ReportOverlay({ visible, onClose, onSubmit }: ReportOverlayProps) {
  const progress = useTransitionProgress(visible, duration.change);
  const dimStyle = useAnimatedStyle(() => ({ opacity: progress.get() }));
  // 닫을 때 덮개가 사라지고 창이 내려가는 움직임이 끝날 때까지 Modal을 남겨 둔다
  const [isMounted, setIsMounted] = useState(visible);
  if (visible && !isMounted) setIsMounted(true);

  useEffect(() => {
    if (visible) return;
    const timer = setTimeout(() => setIsMounted(false), duration.change);
    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <Modal visible={isMounted} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.dim, dimStyle]}>
        <Pressable accessibilityRole="button" accessibilityLabel="신고 닫기" style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      {visible && <ReportSheet onClose={onClose} onSubmit={onSubmit} />}
    </Modal>
  );
}

const styles = StyleSheet.create({
  dim: {
    backgroundColor: colors.dialogDim,
  },
});
