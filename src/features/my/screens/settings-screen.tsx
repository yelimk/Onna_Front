import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { isApiError } from '@/api/api-error';
import { logout } from '@/api/auth';
import { deleteMe } from '@/api/users';
import { AppText } from '@/components/app-text';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { ScreenContainer } from '@/components/screen-container';
import { ScreenHeader } from '@/components/screen-header';
import { spacing } from '@/constants/layout';
import { MenuGroup, MenuRow } from '@/features/my/components/menu-group';
import { usePermissionLabels } from '@/features/my/hooks/use-permission-labels';
import { showApiError } from '@/utils/show-api-error';

/**
 * ③ 마이 탭: 설정. 위치·카메라·알림은 휴대폰의 실제 권한 상태를 보여주고, 누르면 휴대폰 설정으로 간다.
 * 앱 안에서는 권한을 끌 수 없어서 스위치 대신 상태 글자로 둔다 (Figma의 '사진 위치·시간 저장', '다녀갔어요 알림' 스위치는 뺐다, 팀 결정).
 * 로그아웃은 폰에 저장한 출입증을 지운다.
 * 회원 탈퇴는 한 번 더 물은 뒤 서버에 탈퇴를 보내고, 출입증을 지우고 로그인 화면으로 간다.
 * 비밀번호는 다시 묻지 않는다 (백엔드 11월 답변).
 */
export function SettingsScreen() {
  const permissionLabels = usePermissionLabels();
  const openPhoneSettings = () => Linking.openSettings();

  const [isConfirmingWithdraw, setIsConfirmingWithdraw] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const logOut = async () => {
    await logout();
    router.replace('/login');
  };

  const withdraw = async () => {
    setIsConfirmingWithdraw(false);
    // 두 번 눌러도 한 번만 보낸다
    if (isWithdrawing) return;
    setIsWithdrawing(true);
    try {
      await deleteMe();
      await logOut();
    } catch (error) {
      // 401은 이미 로그아웃된 상태라 탈퇴가 끝난 것과 같이 첫 화면으로 보낸다
      if (isApiError(error) && error.status === 401) await logOut();
      else showApiError(error);
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <ScreenContainer background="gray" contentTopGap={spacing.xs} header={<ScreenHeader title="설정" />}>
      <View style={styles.groups}>
        <MenuGroup title="권한">
          <MenuRow
            label="위치"
            description="사진을 열려면 '앱 사용 중' 이상이 필요해요"
            trailing={permissionLabels.location}
            onPress={openPhoneSettings}
            hideArrow
          />
          <MenuRow
            label="카메라"
            description="앱 카메라로만 남길 수 있어요"
            trailing={permissionLabels.camera}
            onPress={openPhoneSettings}
            hideArrow
          />
        </MenuGroup>

        {/* Figma처럼 알림은 묶음을 따로 둔다. 1차는 앱 안 알림 목록만 있어서 이 권한이 없어도 알림 목록은 보인다. 푸시를 붙일 때 쓰려고 온보딩에서 미리 묻는다 */}
        <MenuGroup title="알림">
          <MenuRow
            label="알림 권한"
            description="휴대폰으로 알림을 받으려면 필요해요"
            trailing={permissionLabels.notification}
            onPress={openPhoneSettings}
            hideArrow
          />
        </MenuGroup>

        <MenuGroup title="계정 · 안전">
          {/* Figma 오른쪽 값은 '카카오'지만 앱은 이메일로만 로그인한다. 주소를 보여주면 긴 주소가 줄을 밀어내서 제목만 둔다 (팀 결정) */}
          <MenuRow label="로그인 계정" />
          <MenuRow label="이용약관 · 개인정보 처리방침" onPress={() => router.push('/terms')} />
          <MenuRow label="버전" trailing={Constants.expoConfig?.version ?? '-'} />
        </MenuGroup>
      </View>

      <View style={styles.accountActions}>
        <Pressable hitSlop={8} onPress={() => setIsConfirmingWithdraw(true)}>
          <AppText variant="body02" color="textTertiary">
            회원 탈퇴
          </AppText>
        </Pressable>
        <Pressable hitSlop={8} onPress={logOut}>
          <AppText variant="body02" color="error">
            로그아웃
          </AppText>
        </Pressable>
      </View>

      {/* Figma에 탈퇴 확인 창이 없어서 기록 삭제 확인 창과 같은 모양을 쓴다. 문구는 백엔드와 정한 것 */}
      <ConfirmDialog
        visible={isConfirmingWithdraw}
        title="정말 탈퇴할까요?"
        description="남긴 기록이 모두 사라져요"
        confirmLabel="탈퇴"
        onCancel={() => setIsConfirmingWithdraw(false)}
        onConfirm={withdraw}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  groups: {
    gap: spacing.xl,
  },
  accountActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
});
