import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle } from 'react-native-reanimated';

import { AnimatedAppText, AppText } from '@/components/app-text';
import { Checkbox } from '@/components/checkbox';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/layout';
// 이 파일은 '걷는 시간'도 duration이라고 불러서, 애니메이션 시간은 이름을 바꿔 가져온다
import { duration as motionDuration } from '@/constants/motion';
import { OptionCard } from '@/features/auth/components/option-card';
import { StepTitle } from '@/features/auth/components/step-title';
import {
  walkDurationOptions,
  walkTimeOptions,
  type WalkDuration,
  type WalkTime,
} from '@/features/auth/constants/survey-options';
import { useTransitionProgress } from '@/hooks/use-transition-progress';

type WalkStepProps = {
  walkTimes: WalkTime[];
  walkDuration?: WalkDuration;
  onChangeWalkTimes: (value: WalkTime[]) => void;
  onChangeWalkDuration: (value: WalkDuration) => void;
};

/** 설문 3/3: 주로 걷는 때(여러 개), 한 번에 걷는 시간(하나). 산책길 추천에 쓴다. */
export function WalkStep({ walkTimes, walkDuration, onChangeWalkTimes, onChangeWalkDuration }: WalkStepProps) {
  const toggleTime = (time: WalkTime) =>
    onChangeWalkTimes(walkTimes.includes(time) ? walkTimes.filter((item) => item !== time) : [...walkTimes, time]);

  return (
    <View>
      <StepTitle title={'언제, 얼마나\n걷는 편인가요?'} description="산책길을 추천할 때 써요 · 여러 개 골라도 돼요" />

      <AppText variant="subtitle03" style={styles.label}>
        주로 걷는 때
      </AppText>
      <View style={styles.list}>
        {walkTimeOptions.map((time) => {
          const selected = walkTimes.includes(time);
          return (
            <OptionCard
              key={time}
              title={time}
              selected={selected}
              onPress={() => toggleTime(time)}
              right={<Checkbox checked={selected} />}
            />
          );
        })}
      </View>

      <AppText variant="subtitle03" style={[styles.label, styles.durationLabel]}>
        한번에 걷는 시간
      </AppText>
      <View style={styles.segments}>
        {walkDurationOptions.map((duration) => (
          <DurationOption
            key={duration}
            label={duration}
            selected={walkDuration === duration}
            onPress={() => onChangeWalkDuration(duration)}
          />
        ))}
      </View>
    </View>
  );
}

type DurationOptionProps = {
  label: WalkDuration;
  selected: boolean;
  onPress: () => void;
};

/** 걷는 시간 버튼 하나. 고르면 검정으로 100ms 동안 서서히 바뀐다 (Figma selectbox_big: 디졸브 100ms) */
function DurationOption({ label, selected, onPress }: DurationOptionProps) {
  const progress = useTransitionProgress(selected, motionDuration.press);
  const boxStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(progress.get(), [0, 1], [colors.borderDeactivated, colors.textPrimary]),
    backgroundColor: interpolateColor(progress.get(), [0, 1], [colors.background01, colors.textPrimary]),
  }));
  const textStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.get(), [0, 1], [colors.textPrimary, colors.textInverse]),
  }));

  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress}>
      <Animated.View style={[styles.segment, boxStyle]}>
        <AnimatedAppText variant="subtitle03" style={textStyle}>
          {label}
        </AnimatedAppText>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xxs,
  },
  durationLabel: {
    marginTop: spacing.xl,
  },
  list: {
    gap: spacing.sm,
  },
  segments: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  // GUI에서 시간 버튼은 칸을 나누지 않고 글자 길이만큼만 차지한다
  segment: {
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
