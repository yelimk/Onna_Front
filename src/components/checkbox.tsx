import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { Icon } from '@/components/icon';
import { colors } from '@/constants/colors';
import { radius } from '@/constants/layout';
import { duration } from '@/constants/motion';
import { useTransitionProgress } from '@/hooks/use-transition-progress';

type CheckboxProps = {
  checked: boolean;
  size?: number;
};

/**
 * Figma 온보딩 selectbox_check의 네모 체크. 체크 표시만 그리고, 누르는 영역은 감싸는 쪽(Pressable)이 정한다.
 * 약관처럼 동그란 체크가 필요하면 Radio를 쓴다.
 * 빈 네모 위에 검정 체크 네모를 겹쳐 두고 100ms 동안 서서히 나타나게 한다 (Figma selectbox: 디졸브 100ms).
 */
export function Checkbox({ checked, size = 28 }: CheckboxProps) {
  const progress = useTransitionProgress(checked, duration.press);
  const checkedStyle = useAnimatedStyle(() => ({ opacity: progress.get() }));

  return (
    <View style={[styles.box, { width: size, height: size }]}>
      <Animated.View style={[styles.checked, checkedStyle]}>
        <Icon name="check" size={size - 4} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.iconStroke,
    overflow: 'hidden',
  },
  // 테두리까지 덮어야 검정 네모로 보여서 테두리 두께만큼 밖으로 넓힌다
  checked: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.textPrimary,
  },
});
