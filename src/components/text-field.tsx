import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import Animated, { FadeIn, FadeInUp, interpolateColor, useAnimatedStyle } from 'react-native-reanimated';

import { AppText } from '@/components/app-text';
import { Icon } from '@/components/icon';
import { colors, type ColorName } from '@/constants/colors';
import { radius, spacing } from '@/constants/layout';
import { duration, easeOut } from '@/constants/motion';
import { typography } from '@/constants/typography';
import { useTransitionProgress } from '@/hooks/use-transition-progress';

type TextFieldProps = Omit<TextInputProps, 'secureTextEntry'> & {
  /** 입력창 위 이름. 없으면 입력창만 보여준다. */
  label?: string;
  /** 꼭 써야 하는 칸이면 이름 뒤에 빨간 * 를 붙인다 */
  required?: boolean;
  /** 이름 옆 회색 작은 안내 (예: 해시태그 제목 옆 '최대 3개 선택'과 같은 모양). 쓰기 전에 읽어야 하는 말에 쓴다. */
  labelHint?: string;
  /** 입력창 아래 작은 안내 문구 */
  helper?: string;
  /** 있으면 빨간 테두리와 빨간 안내 문구로 보여준다 */
  error?: string;
  /** 규칙에 맞았을 때 초록 안내 문구 (예: '비밀번호가 일치합니다'). error가 있으면 error가 먼저다. */
  success?: string;
  /** 입력창 오른쪽에 붙는 버튼 등 (예: 인증 요청) */
  accessory?: ReactNode;
  /** maxLength와 함께 쓰면 오른쪽 아래에 '22/40'처럼 글자 수를 보여준다 */
  showCount?: boolean;
  /** 비밀번호 칸. 오른쪽 눈 아이콘으로 보이기·숨기기를 바꾼다. */
  isPassword?: boolean;
  /**
   * 글자 수 한도. maxLength처럼 막지 않고 넘겨서 쓸 수 있게 두되, 넘으면 빨간 테두리와 오른쪽 '글자수 초과'로 알린다 (Figma 한 줄 남기기 오류).
   * 오른쪽 아래에 '7/15'처럼 글자 수도 보여준다.
   */
  limit?: number;
};

/**
 * Figma 로그인/회원가입 inputfield.
 * 기본은 회색 칸, 입력하는 중(포커스)에는 흰 칸에 검정 테두리, 에러면 빨간 테두리와 빨간 글자.
 * Figma 프로토타입처럼 포커스 테두리는 100ms(디졸브), 빨간 테두리는 180ms 동안 서서히 바뀐다 (둘 다 Ease out).
 */
export function TextField({
  label,
  required = false,
  labelHint,
  helper,
  error,
  success,
  accessory,
  showCount = false,
  isPassword = false,
  limit,
  style,
  onFocus,
  onBlur,
  ...rest
}: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const length = rest.value?.length ?? 0;
  const countLimit = limit ?? (showCount ? rest.maxLength : undefined);
  const count = countLimit ? `${length}/${countLimit}` : undefined;
  const isOverLimit = limit !== undefined && length > limit;
  const hasError = error !== undefined || isOverLimit;
  const bottomText = error ?? success ?? helper;

  const focusProgress = useTransitionProgress(isFocused, duration.press);
  const errorProgress = useTransitionProgress(hasError, duration.change);
  // 포커스(검정)를 먼저 섞고, 그 위에 에러(빨강)를 섞는다. 에러가 있으면 포커스와 상관없이 빨간 테두리라서다
  const boxStyle = useAnimatedStyle(() => {
    const focusBorder = interpolateColor(focusProgress.get(), [0, 1], [colors.background02, colors.textPrimary]);
    const focusBackground = interpolateColor(focusProgress.get(), [0, 1], [colors.background02, colors.background01]);
    return {
      borderColor: interpolateColor(errorProgress.get(), [0, 1], [focusBorder, colors.error]),
      backgroundColor: interpolateColor(errorProgress.get(), [0, 1], [focusBackground, colors.background01]),
    };
  });

  return (
    <View>
      {label && (
        <View style={styles.labelRow}>
          <AppText variant="caption01" color="textSecondary">
            {label}
            {required && <AppText variant="caption01" color="requiredMark">*</AppText>}
          </AppText>
          {labelHint && (
            <AppText variant="caption03" color="textDeactivated" style={styles.labelHint}>
              {labelHint}
            </AppText>
          )}
        </View>
      )}
      <View style={styles.row}>
        <Animated.View style={[styles.box, boxStyle]}>
          <TextInput
            placeholderTextColor={colors.textPlaceholder}
            secureTextEntry={isPassword && !isPasswordVisible}
            onFocus={(event) => {
              setIsFocused(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setIsFocused(false);
              onBlur?.(event);
            }}
            style={[styles.input, hasError && styles.errorText, style]}
            {...rest}
          />
          {isPassword && (
            <Pressable
              accessibilityLabel={isPasswordVisible ? '비밀번호 숨기기' : '비밀번호 보기'}
              hitSlop={8}
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
              <Icon name={isPasswordVisible ? 'eyeOpen' : 'eyeClosed'} />
            </Pressable>
          )}
        </Animated.View>
        {accessory}
      </View>
      {(bottomText || count) && (
        <View style={styles.bottomRow}>
          {/* 문구가 바뀔 때마다 서서히 나타난다 */}
          <Animated.View key={bottomText ?? ''} entering={getHelperEntering(error, success)} style={styles.helper}>
            <AppText variant="caption02" color={getHelperColor(error, success)}>
              {bottomText}
            </AppText>
          </Animated.View>
          {count && (
            <AppText variant="caption04" color={isOverLimit ? 'error' : 'textDeactivated'}>
              {isOverLimit ? '글자수 초과' : count}
            </AppText>
          )}
        </View>
      )}
    </View>
  );
}

// Figma 회원가입 '사용할 수 있어요': 입력칸 바로 밑(24 위)에 투명하게 있다가 0.1초 뒤 300ms 동안 내려오며 나타난다
const successHelperDrop = 24;
const successHelperDelay = 100;

/**
 * 안내 문구가 나타나는 움직임. Figma 프로토타입 값:
 * - 초록 문구('사용할 수 있어요', '비밀번호가 일치합니다'): 0.1초 뒤 위에서 24 내려오며 나타남 (스마트 애니메이트 300ms, Ease out)
 * - 빨간 문구: 빨간 테두리와 같이 180ms
 * - 회색 안내: Figma에 없어서 빨간 문구와 같이 둔다
 */
function getHelperEntering(error: string | undefined, success: string | undefined) {
  if (error === undefined && success !== undefined) {
    return FadeInUp.withInitialValues({ opacity: 0, transform: [{ translateY: -successHelperDrop }] })
      .delay(successHelperDelay)
      .duration(duration.screen)
      .easing(easeOut);
  }
  return FadeIn.duration(duration.change);
}

function getHelperColor(error: string | undefined, success: string | undefined): ColorName {
  if (error !== undefined) return 'error';
  if (success !== undefined) return 'success';
  return 'textTertiary';
}

const styles = StyleSheet.create({
  // Figma inputfield: 이름 → 칸은 8, 칸 → 안내 문구는 4 띄우고, 이름과 안내 문구는 안쪽으로 8 들여 쓴다
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
    paddingLeft: spacing.xs,
  },
  // 좁은 폰에서 안내가 길면 이름을 밀어내지 않고 안내만 줄어든다
  labelHint: {
    flexShrink: 1,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  // Figma 입력칸 세트는 높이를 모두 50으로 통일했다 (테두리 1.5 포함). 글자 위아래 여백으로 맞추면 폰마다 줄 높이가 달라 50을 넘어서 높이를 고정한다.
  box: {
    flex: 1,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  input: {
    ...typography.body01,
    flex: 1,
    paddingVertical: 0,
    color: colors.textPrimary,
    // 웹 미리보기에서 브라우저 기본 포커스 테두리가 칸 테두리와 겹쳐서 끈다 (폰에는 없음)
    outlineWidth: 0,
  },
  errorText: {
    color: colors.error,
  },
  bottomRow: {
    marginTop: spacing.xxs,
    paddingHorizontal: spacing.xs,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  helper: {
    flex: 1,
  },
});
