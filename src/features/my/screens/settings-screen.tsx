import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { logout } from '@/api/auth';
import { AppText } from '@/components/app-text';
import { ScreenContainer } from '@/components/screen-container';
import { ScreenHeader } from '@/components/screen-header';
import { Toggle } from '@/components/toggle';
import { spacing } from '@/constants/layout';
import { MenuGroup, MenuRow } from '@/features/my/components/menu-group';
import { usePermissionLabels } from '@/features/my/hooks/use-permission-labels';

/**
 * ③ 마이 탭: 설정. 위치·카메라는 휴대폰의 실제 권한 상태를 보여주고, 허용이 안 됐으면 누르면 휴대폰 설정으로 간다.
 * 로그아웃은 폰에 저장한 출입증을 지운다. 스위치와 탈퇴는 서버 API가 아직 없어서 화면만 있다.
 */
export function SettingsScreen() {
  const permissionLabels = usePermissionLabels();
  const [savesPhotoLocation, setSavesPhotoLocation] = useState(true);
  const [visitNotification, setVisitNotification] = useState(true);
  const openPhoneSettings = permissionLabels.isAllGranted ? undefined : () => Linking.openSettings();

  const logOut = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <ScreenContainer background="gray" contentTopGap={spacing.xs} header={<ScreenHeader title="설정" />}>
      <View style={styles.groups}>
        <MenuGroup title="권한">
          <MenuRow
            label="위치 권한"
            description="다가가서 열리려면 '앱 사용 중' 이상 필요"
            trailing={permissionLabels.location}
            onPress={openPhoneSettings}
          />
          <MenuRow
            label="카메라"
            description="앱 카메라로만 남길 수 있어요"
            trailing={permissionLabels.camera}
            onPress={openPhoneSettings}
          />
          <MenuRow
            label="사진 위치·시간 저장"
            description="꺼져 있으면 기록을 남길 수 없어요"
            trailing={<Toggle value={savesPhotoLocation} onChange={setSavesPhotoLocation} />}
          />
        </MenuGroup>

        <MenuGroup title="알림">
          <MenuRow
            label="다녀갔어요 알림"
            description="내 순간에 좋아요가 닿으면 조용히 알려요"
            trailing={<Toggle value={visitNotification} onChange={setVisitNotification} />}
          />
        </MenuGroup>

        <MenuGroup title="계정 · 안전">
          <MenuRow label="이용약관 · 개인정보 처리방침" onPress={() => router.push('/terms')} />
          <MenuRow label="버전" trailing={Constants.expoConfig?.version ?? '-'} />
        </MenuGroup>
      </View>

      <View style={styles.accountActions}>
        <Pressable hitSlop={8}>
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
