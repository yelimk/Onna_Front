import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { isApiError } from '@/api/api-error';
import { login } from '@/api/auth';
import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { ScreenContainer } from '@/components/screen-container';
import { TextField } from '@/components/text-field';
import { sectionGap, spacing } from '@/constants/layout';
import { goAfterLogin } from '@/features/auth/utils/go-after-login';
import { showApiError } from '@/utils/show-api-error';

/**
 * 시작: 이메일 로그인. 서버에서 받은 출입증을 저장하고, 설문 여부에 따라 지도나 권한 안내로 보낸다.
 * 틀리면 두 칸을 빨갛게 하고 서버 문구를 보여준다 (Figma 로그인 오류 화면).
 */
export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !isSubmitting;

  // 다시 고치기 시작하면 빨간 표시를 지운다
  const changeEmail = (value: string) => {
    setEmail(value);
    setLoginError(undefined);
  };
  const changePassword = (value: string) => {
    setPassword(value);
    setLoginError(undefined);
  };

  const submit = async () => {
    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      await goAfterLogin();
    } catch (error) {
      if (isApiError(error, 'LOGIN_FAILED')) setLoginError(error.message);
      else showApiError(error);
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
          // 둘 중 무엇이 틀렸는지 서버가 알려주지 않아서 두 칸 모두 빨갛게만 하고 문구는 아래 칸에 한 번만 쓴다
          error={loginError === undefined ? undefined : ''}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <TextField
          label="비밀번호"
          placeholder="비밀번호를 입력해 주세요"
          value={password}
          onChangeText={changePassword}
          error={loginError}
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
        label={isSubmitting ? '로그인 중…' : '로그인'}
        variant="primary"
        disabled={!canSubmit}
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
