import { Text, type TextProps } from 'react-native';
import Animated from 'react-native-reanimated';

import { colors, type ColorName } from '@/constants/colors';
import { typography, type TypographyVariant } from '@/constants/typography';

type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  color?: ColorName;
};

/**
 * 앱의 모든 글자는 이 컴포넌트로 쓴다.
 * 예: <AppText variant="heading01">제목</AppText>
 */
export function AppText({ variant = 'body01', color = 'textPrimary', style, ...rest }: AppTextProps) {
  return <Text style={[typography[variant], { color: colors[color] }, style]} {...rest} />;
}

/** 글자색을 서서히 바꿀 때 쓰는 AppText (Figma 디졸브). style에 useAnimatedStyle의 color를 넣는다 */
export const AnimatedAppText = Animated.createAnimatedComponent(AppText);
