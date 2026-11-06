import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { AppText } from '@/components/app-text';
import { Icon } from '@/components/icon';
import { Radio } from '@/components/radio';
import { spacing } from '@/constants/layout';
import { duration } from '@/constants/motion';
import type { TermsDocumentId } from '@/constants/terms';
import { useTransitionProgress } from '@/hooks/use-transition-progress';

export const requiredTerms = ['이용약관', '개인정보 수집·이용', '위치기반 서비스 이용', '만 14세 이상이에요'] as const;
export type TermName = (typeof requiredTerms)[number];

/** 줄마다 화살표를 누르면 여는 약관 문서 (constants/terms.ts) */
const termDocumentIds: Record<TermName, TermsDocumentId> = {
  이용약관: 'service',
  '개인정보 수집·이용': 'privacyConsent',
  '위치기반 서비스 이용': 'location',
  '만 14세 이상이에요': 'age',
};

// Figma 약관 줄 오른쪽 화살표(24)보다 누르는 영역을 넓힌다
const arrowHitSlop = spacing.sm;

type TermsAgreementProps = {
  agreed: TermName[];
  onChange: (agreed: TermName[]) => void;
};

/**
 * 회원가입 마지막 단계의 약관 동의 목록. 모두 필수라 전부 골라야 다음으로 간다.
 * 줄을 누르면 동의가 바뀌고, 오른쪽 화살표를 누르면 그 약관 문서가 열린다 (/terms?doc=...).
 * 동의를 누르면 동그라미가 100ms 동안 서서히 채워진다 (Figma 프로토타입 checkbox: 디졸브 100ms, Ease out).
 */
export function TermsAgreement({ agreed, onChange }: TermsAgreementProps) {
  const toggle = (term: TermName) =>
    onChange(agreed.includes(term) ? agreed.filter((item) => item !== term) : [...agreed, term]);

  return (
    <View>
      {requiredTerms.map((term) => (
        <TermRow key={term} term={term} selected={agreed.includes(term)} onToggle={() => toggle(term)} />
      ))}
    </View>
  );
}

type TermRowProps = {
  term: TermName;
  selected: boolean;
  onToggle: () => void;
};

function TermRow({ term, selected, onToggle }: TermRowProps) {
  const progress = useTransitionProgress(selected, duration.press);
  const checkedStyle = useAnimatedStyle(() => ({ opacity: progress.get() }));

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected }}
        onPress={onToggle}
        style={styles.label}>
        {/* 빈 동그라미 위에 채운 동그라미를 겹쳐 두고 투명도만 바꾼다. 그림이라 색을 직접 섞을 수 없어서다 */}
        <View>
          <Radio selected={false} />
          <Animated.View style={[StyleSheet.absoluteFill, checkedStyle]}>
            <Radio selected />
          </Animated.View>
        </View>
        <AppText variant="body01" color={selected ? 'textPrimary' : 'textTertiary'}>
          [필수] {term}
        </AppText>
      </Pressable>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`${term} 보기`}
        hitSlop={arrowHitSlop}
        onPress={() => router.push({ pathname: '/terms', params: { doc: termDocumentIds[term] } })}>
        <Icon name="forwardSmall" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  label: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
});
