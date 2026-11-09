import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { IconButton } from '@/components/icon-button';
import { ScreenContainer } from '@/components/screen-container';
import { spacing } from '@/constants/layout';
import { ActivityMenu } from '@/features/my/components/activity-menu';
import { ProfileCard, StatsCard } from '@/features/my/components/profile-summary';
import { useMySummary } from '@/features/my/hooks/use-my-summary';
import { useHasNewNotifications } from '@/features/notification/hooks/use-has-new-notifications';

// Figma 마이 알림 종(bell_circle): 48 동그라미 안 아이콘 26
const bellIconSize = 26;

/**
 * ③ 마이 탭: 프로필, 내 숫자, 메뉴. 알림은 오른쪽 위 종 버튼으로 들어간다.
 * 칭호와 숫자는 서버 업적 API에서 받는다. 칭호 맨 앞의 '초보 탐험가'만 앱이 붙인다(utils/get-profile-badges.ts).
 */
export function MyScreen() {
  const { nickname, badges, leftCount, openedCount, likedCount } = useMySummary();
  const hasNewNotifications = useHasNewNotifications();

  return (
    <ScreenContainer withBottomInset={false} background="gray" contentTopGap={spacing.xs}>
      <View style={styles.titleRow}>
        <AppText variant="heading02" style={styles.title}>
          마이
        </AppText>
        <IconButton
          icon="bell"
          size={48}
          iconSize={bellIconSize}
          shadow="soft"
          showPressed
          // Figma 마이 알림 종: 새 알림이 있으면 오른쪽 위 빨간 점. 테두리는 마이 회색 바탕색
          showBadge={hasNewNotifications}
          badgeOutlineColor="background02"
          accessibilityLabel={hasNewNotifications ? "알림, 새 알림 있음" : "알림"}
          onPress={() => router.push('/my/notifications')}
        />
      </View>

      <View style={styles.sections}>
        <ProfileCard nickname={nickname} badges={badges} />
        <StatsCard
          stats={[
            { label: '남긴 자리', value: leftCount },
            { label: '연 자리', value: openedCount },
            { label: '좋아한 자리', value: likedCount },
          ]}
        />
        <ActivityMenu
          title="내 활동"
          items={[
            { icon: 'heartMedium', label: '좋아요 내역', onPress: () => router.push('/my/likes') },
            { icon: 'unlockMedium', label: '연 자리 기록', onPress: () => router.push('/my/opened-history') },
            { icon: 'hashtagMedium', label: '사용자 기호 설정', onPress: () => router.push('/my/preferences') },
            { icon: 'settingsMedium', label: '설정', onPress: () => router.push('/my/settings') },
          ]}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: {
    paddingHorizontal: spacing.xs,
  },
  // Figma 마이: 카드끼리 12
  sections: {
    gap: spacing.sm,
  },
});
