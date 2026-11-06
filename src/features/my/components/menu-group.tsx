import { Children, Fragment, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Icon, type IconName } from '@/components/icon';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/layout';

/** 흰 카드 안에 줄들을 묶는다. 줄 사이에는 구분선이 들어가서, 줄마다 마지막인지 따로 알려줄 필요가 없다. */
export function MenuGroup({ title, children }: { title?: string; children: ReactNode }) {
  const rows = Children.toArray(children);

  return (
    <View style={styles.groupWrapper}>
      {title && (
        <AppText variant="caption01" color="textTertiary" style={styles.groupTitle}>
          {title}
        </AppText>
      )}
      <View style={styles.group}>
        {rows.map((row, index) => (
          <Fragment key={index}>
            {index > 0 && <View style={styles.divider} />}
            {row}
          </Fragment>
        ))}
      </View>
    </View>
  );
}

type MenuRowProps = {
  label: string;
  /** 제목 아래 작은 설명 */
  description?: string;
  /** 마이 메뉴처럼 글자 앞에 붙는 작은 아이콘(16). 있으면 줄이 한 단계 작아진다. */
  icon?: IconName;
  /** 오른쪽 끝: 글자 값, 스위치 등 */
  trailing?: ReactNode;
  /** 있으면 누를 수 있고, 오른쪽에 > 가 붙는다 */
  onPress?: () => void;
  /** 눌러도 > 를 숨긴다. Figma 설정의 권한 줄은 상태 글자만 있고 > 가 없다 */
  hideArrow?: boolean;
  /**
   * 오른쪽 글자가 길 수 있는 줄 (예: 로그인 계정 이메일). 이름은 그대로 두고 오른쪽 글자를 한 줄로 자르고 끝을 '…'로 줄인다.
   * 이름과 오른쪽 글자 사이는 8이다 (디자이너 요청)
   */
  truncateTrailing?: boolean;
};

/** 마이·설정의 한 줄. 마이 메뉴(아이콘 있음)는 Figma 52 높이, 설정 줄은 60 높이다. */
export function MenuRow({
  label,
  description,
  icon,
  trailing,
  onPress,
  hideArrow = false,
  truncateTrailing = false,
}: MenuRowProps) {
  const showsArrow = Boolean(onPress) && !hideArrow;
  // 오른쪽에 화살표나 스위치가 오면 그 자체에 여백이 있어서 오른쪽 안쪽 여백을 줄인다
  const hasRightControl = showsArrow || typeof trailing === 'object';

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={[
        styles.row,
        icon ? styles.compactRow : styles.regularRow,
        hasRightControl && styles.rowWithControl,
        truncateTrailing && styles.truncatingRow,
      ]}>
      {icon && <Icon name={icon} size={16} />}
      <View style={[styles.texts, truncateTrailing && styles.fixedTexts]}>
        <AppText variant={icon ? 'subtitle04' : 'subtitle03'}>{label}</AppText>
        {description && (
          <AppText variant="caption04" color="textTertiary">
            {description}
          </AppText>
        )}
      </View>
      {typeof trailing === 'string' ? (
        <AppText
          variant="body02"
          numberOfLines={truncateTrailing ? 1 : undefined}
          style={truncateTrailing && styles.truncatedTrailing}>
          {trailing}
        </AppText>
      ) : (
        trailing
      )}
      {showsArrow && <Icon name="forwardSmall" />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  groupWrapper: {
    gap: spacing.xs,
  },
  groupTitle: {
    paddingHorizontal: spacing.xs,
  },
  group: {
    borderRadius: radius.md,
    backgroundColor: colors.background01,
  },
  // Figma 설정: 줄 사이 선 0.5, Gray/300
  divider: {
    height: 0.5,
    backgroundColor: colors.borderDeactivated,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  compactRow: {
    minHeight: 52,
    gap: spacing.xs,
  },
  regularRow: {
    minHeight: 60,
    gap: spacing.md,
  },
  rowWithControl: {
    paddingRight: spacing.xs,
  },
  texts: {
    flex: 1,
    gap: spacing.xxs,
  },
  truncatingRow: {
    gap: spacing.xs,
  },
  // 이름은 제 길이를 지키고 남는 자리를 차지한다. 줄어드는 건 오른쪽 글자다
  fixedTexts: {
    flexBasis: 'auto',
    flexShrink: 0,
  },
  truncatedTrailing: {
    flexShrink: 1,
    textAlign: 'right',
  },
});
