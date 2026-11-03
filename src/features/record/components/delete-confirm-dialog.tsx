import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/layout';

type DeleteConfirmDialogProps = {
  visible: boolean;
  onCancel: () => void;
  onDelete: () => void;
};

// Figma 삭제 확인 창의 '취소 | 삭제' 버튼 줄 높이 (사이 세로선도 이 높이)
const actionHeight = 40;

/** 내 기록 삭제 전에 한 번 묻는 창 (Figma 기록 상세 > 삭제). 지운 기록은 되돌릴 수 없어서 꼭 묻는다. */
export function DeleteConfirmDialog({ visible, onCancel, onDelete }: DeleteConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.dim}>
        <View style={styles.dialog}>
          <View style={styles.texts}>
            <AppText variant="subtitle03" style={styles.center}>
              삭제하시겠습니까?
            </AppText>
            <AppText variant="caption02" color="textTertiary" style={styles.center}>
              삭제한 기록은 다시 복구할 수 없어요
            </AppText>
          </View>
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" onPress={onCancel} style={styles.action}>
              <AppText variant="button04" color="textDeactivated">
                취소
              </AppText>
            </Pressable>
            <View style={styles.actionDivider} />
            <Pressable accessibilityRole="button" onPress={onDelete} style={styles.action}>
              <AppText variant="button04" color="error">
                삭제
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
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
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderDeactivated,
  },
  action: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderDeactivated,
  },
});
