import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AppText } from '@/components/app-text';
import { Icon } from '@/components/icon';
import { colors, type ColorName } from '@/constants/colors';
import { radius, spacing } from '@/constants/layout';
import { duration } from '@/constants/motion';
import { typography } from '@/constants/typography';

type TextFieldProps = Omit<TextInputProps, 'secureTextEntry'> & {
  /** 입력창 위 이름. 없으면 입력창만 보여준다. */
  label?: string;
  /** 꼭 써야 하는 칸이면 이름 뒤에 빨간 * 를 붙인다 */
  required?: boolean;
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
 */
export function TextField({
  label,
  required = false,
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

  return (
    <View>
      {label && (
        <AppText variant="caption01" color="textSecondary" style={styles.label}>
          {label}
          {required && <AppText variant="caption01" color="requiredMark">*</AppText>}
        </AppText>
      )}
      <View style={styles.row}>
        <View style={[styles.box, isFocused && styles.focusedBox, hasError && styles.errorBox]}>
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
        </View>
        {accessory}
      </View>
      {(bottomText || count) && (
        <View style={styles.bottomRow}>
          {/* 문구가 바뀔 때마다 서서히 나타난다 ('비밀번호가 일치합니다', '사용할 수 있어요' 등, Figma 애니메이션 회원가입) */}
          <Animated.View key={bottomText ?? ''} entering={FadeIn.duration(duration.normal)} style={styles.helper}>
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

function getHelperColor(error: string | undefined, success: string | undefined): ColorName {
  if (error !== undefined) return 'error';
  if (success !== undefined) return 'success';
  return 'textTertiary';
}

const styles = StyleSheet.create({
  // Figma inputfield: 이름 → 칸은 8, 칸 → 안내 문구는 4 띄우고, 이름과 안내 문구는 안쪽으로 8 들여 쓴다
  label: {
    marginBottom: spacing.xs,
    paddingLeft: spacing.xs,
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
    borderColor: colors.background02,
    backgroundColor: colors.background02,
  },
  focusedBox: {
    borderColor: colors.textPrimary,
    backgroundColor: colors.background01,
  },
  errorBox: {
    borderColor: colors.error,
    backgroundColor: colors.background01,
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
