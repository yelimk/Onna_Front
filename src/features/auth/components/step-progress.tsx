import { StyleSheet, View } from 'react-native';

import { colors } from '@/constants/colors';
import { radius } from '@/constants/layout';

type StepProgressProps = {
  step: number;
  totalSteps: number;
};

/** 설문·회원가입 머리 아래 진행 막대. 지금 단계만큼 검정으로 채운다. */
export function StepProgress({ step, totalSteps }: StepProgressProps) {
  const progress = `${(step / totalSteps) * 100}%` as const;

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: progress }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  // Figma 설문·회원가입: 진행 막대는 화면 머리(56) 맨 아래 4에 겹쳐 있다
  track: {
    height: 4,
    marginTop: -4,
    borderRadius: radius.xs,
    backgroundColor: colors.disabledBackground,
  },
  fill: {
    height: 4,
    borderRadius: radius.xs,
    backgroundColor: colors.textPrimary,
  },
});
