import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { AppText } from '@/components/app-text';
import { Icon } from '@/components/icon';
import { Radio } from '@/components/radio';
import { spacing } from '@/constants/layout';
import { usePopStyle } from '@/hooks/use-pop-style';

export const requiredTerms = ['이용약관', '개인정보 수집·이용', '위치기반 서비스 이용', '만 14세 이상이에요'] as const;
export type TermName = (typeof requiredTerms)[number];

type TermsAgreementProps = {
  agreed: TermName[];
  onChange: (agreed: TermName[]) => void;
};

/**
 * 회원가입 마지막 단계의 약관 동의 목록. 모두 필수라 전부 골라야 다음으로 간다.
 * 줄을 누르면 동의가 바뀐다. 약관 전문이 아직 없어서 오른쪽 화살표는 모양만 두고 누를 수 없게 했다 (팀 결정).
 * 동의하는 순간 동그라미가 톡 튄다 (Figma 애니메이션: 약관동의 버튼 터치 시).
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
  const popStyle = usePopStyle(selected);

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected }}
        onPress={onToggle}
        style={styles.label}>
        <Animated.View style={popStyle}>
          <Radio selected={selected} />
        </Animated.View>
        <AppText variant="body01" color={selected ? 'textPrimary' : 'textTertiary'}>
          [필수] {term}
        </AppText>
      </Pressable>
      <Icon name="forwardSmall" />
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
