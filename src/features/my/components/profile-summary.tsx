import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/layout';

// 57 - 20 - 닉네임 줄 높이(22 × 1.2). 디자인 시스템 간격 8·12 사이 값이라 이 카드에만 쓴다
const nicknameToBadgesGap = 10.6;

type ProfileCardProps = {
  nickname: string;
  badges: string[];
};

/** 닉네임과 칭호. 닉네임은 내 화면에서만 보이고, 남긴 사진은 늘 익명이다. */
export function ProfileCard({ nickname, badges }: ProfileCardProps) {
  return (
    <View style={[styles.card, styles.profile]}>
      <View style={styles.nameRow}>
        <AppText variant="heading03">{nickname}</AppText>
        <AppText variant="subtitle03" color="textTertiary">
          님
        </AppText>
      </View>
      <View style={styles.badges}>
        {badges.map((badge) => (
          <View key={badge} style={styles.badge}>
            <AppText variant="caption01" color="primary">
              {badge}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

type StatsCardProps = {
  stats: { label: string; value: number }[];
};

/** 남긴·연·좋아요한 자리 수. 순위 없이 나만 보는 숫자다. */
export function StatsCard({ stats }: StatsCardProps) {
  return (
    <View style={[styles.card, styles.stats]}>
      {stats.map((stat, index) => (
        <Fragment key={stat.label}>
          {index > 0 && <View style={styles.statDivider} />}
          <View style={styles.stat}>
            <AppText variant="subtitle02">{stat.value}</AppText>
            <AppText variant="caption04" color="textDeactivated">
              {stat.label}
            </AppText>
          </View>
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    backgroundColor: colors.background01,
  },
  // Figma 프로필 카드: 옆 16, 위아래 20. 닉네임과 칭호 사이는 Figma 위치(닉네임 위 20, 칭호 위 57)로 계산한 값이다
  profile: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    gap: nicknameToBadgesGap,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xxs,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  badge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    borderRadius: radius.sm,
    backgroundColor: colors.selectedBackground,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xxs,
    paddingVertical: 6,
  },
  statDivider: {
    width: 0.5,
    height: 29,
    backgroundColor: colors.borderDeactivated,
  },
});
