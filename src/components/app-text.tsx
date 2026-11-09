import { Text, type TextProps } from 'react-native';
import Animated from 'react-native-reanimated';

import { colors, type ColorName } from '@/constants/colors';
import { typography, type TypographyVariant } from '@/constants/typography';
import { keepAllWords } from '@/utils/keep-all';

type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  color?: ColorName;
  /**
   * 줄을 띄어쓰기 자리에서만 바꾼다(웹의 word-break: keep-all). 여러 줄로 꺾이는 안내 문장에 쓴다.
   * 글자(문자열)만 넘길 때 적용된다.
   */
  keepAll?: boolean;
};

/**
 * 앱의 모든 글자는 이 컴포넌트로 쓴다.
 * 예: <AppText variant="heading01">제목</AppText>
 */
export function AppText({
  variant = 'body01',
  color = 'textPrimary',
  keepAll = false,
  style,
  children,
  ...rest
}: AppTextProps) {
  const content = keepAll && typeof children === 'string' ? keepAllWords(children) : children;
  return (
    <Text
      style={[typography[variant], { color: colors[color] }, style]}
      // 아이폰은 한글을 단어 단위로 꺾는 설정이 있어서 같이 켠다 (안드로이드는 keepAllWords가 맡는다)
      lineBreakStrategyIOS={keepAll ? 'hangul-word' : undefined}
      {...rest}>
      {content}
    </Text>
  );
}

/** 글자색을 서서히 바꿀 때 쓰는 AppText (Figma 디졸브). style에 useAnimatedStyle의 color를 넣는다 */
export const AnimatedAppText = Animated.createAnimatedComponent(AppText);
