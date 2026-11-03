import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { isApiError } from '@/api/api-error';
import { login } from '@/api/auth';
import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { ScreenContainer } from '@/components/screen-container';
import { TextField } from '@/components/text-field';
import { showToast } from '@/components/toast';
import { sectionGap, spacing } from '@/constants/layout';
import { goAfterLogin } from '@/features/auth/utils/go-after-login';
import { showApiErrorToast } from '@/utils/show-api-error';

/**
 * 시작: 이메일 로그인. 서버에서 받은 출입증을 저장하고, 설문 여부에 따라 지도나 권한 안내로 보낸다.
 * 틀리면 두 칸을 빨갛게 하고 위쪽 토스트로 알려준다 (Figma 로그인 오류 화면).
 */
export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hasLoginFailed, setHasLoginFailed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 다시 고치기 시작하면 빨간 표시를 지운다
  const changeEmail = (value: string) => {
    setEmail(value);
    setHasLoginFailed(false);
  };
  const changePassword = (value: string) => {
    setPassword(value);
    setHasLoginFailed(false);
  };

  const failLogin = () => {
    setHasLoginFailed(true);
    showToast('이메일 또는 비밀번호가 일치하지 않습니다', 'error');
  };

  // Figma처럼 로그인 버튼은 늘 눌린다. 빈 칸으로 누르면 서버에 보내지 않고 틀렸을 때와 똑같이 알려준다.
  const submit = async () => {
    if (isSubmitting) return;
    if (email.trim().length === 0 || password.length === 0) {
      failLogin();
      return;
    }
    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      await goAfterLogin();
    } catch (error) {
      // 이메일 모양이 틀린 것(INVALID_INPUT)도 Figma에 따로 화면이 없어서 '일치하지 않습니다'로 같이 보여준다
      if (isApiError(error, 'LOGIN_FAILED') || isApiError(error, 'INVALID_INPUT')) failLogin();
      else showApiErrorToast(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <AppText variant="heading01">로그인</AppText>

      <View style={styles.form}>
        <TextField
          label="이메일"
          placeholder="이메일을 입력해 주세요"
          value={email}
          onChangeText={changeEmail}
          // 둘 중 무엇이 틀렸는지 서버가 알려주지 않아서 두 칸 모두 빨갛게만 하고, 문구는 토스트로 한 번만 보여준다
          error={hasLoginFailed ? '' : undefined}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <TextField
          label="비밀번호"
          placeholder="비밀번호를 입력해 주세요"
          value={password}
          onChangeText={changePassword}
          error={hasLoginFailed ? '' : undefined}
          isPassword
          autoComplete="current-password"
        />
      </View>

      <Link href="/signup" style={styles.signupLink}>
        <AppText variant="button04" color="textTertiary" style={styles.underline}>
          아직 회원이 아니신가요?
        </AppText>
      </Link>

      {/* 키보드가 올라와도 가려지지 않게 GUI처럼 버튼을 입력칸 바로 아래에 둔다 */}
      <Button
        label="로그인"
        variant="primary"
        onPress={submit}
        style={styles.loginButton}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  form: {
    marginTop: sectionGap,
    gap: spacing.xl,
  },
  signupLink: {
    marginTop: spacing.xxl,
    alignSelf: 'center',
  },
  underline: {
    textDecorationLine: 'underline',
  },
  loginButton: {
    marginTop: sectionGap,
  },
});
