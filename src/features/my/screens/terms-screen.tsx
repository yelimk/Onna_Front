import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { ScreenHeader } from '@/components/screen-header';
import { spacing } from '@/constants/layout';
import { isTermsDocumentId, settingsTermsDocumentIds, termsDocuments } from '@/constants/terms';
import { TermsDocumentCard } from '@/features/my/components/terms-document-card';

/**
 * 이용약관·개인정보 처리방침. 설정에서 들어오면 세 문서(이용약관, 위치기반 서비스 이용약관, 개인정보 처리방침)를 차례로 보여준다.
 * 회원가입 약관 줄의 화살표로 들어오면(/terms?doc=...) 그 문서 하나만 보여준다.
 * 로그인 전(회원가입)에도 열려야 해서 마이 탭 안이 아니라 최상위 주소(/terms)에 둔다.
 */
export function TermsScreen() {
  const { doc } = useLocalSearchParams<{ doc?: string }>();
  const singleDocument = isTermsDocumentId(doc) ? termsDocuments[doc] : undefined;
  const title = singleDocument?.title ?? '이용약관 · 개인정보 처리방침';

  return (
    <ScreenContainer background="gray" contentTopGap={spacing.xs} header={<ScreenHeader title={title} smallTitle />}>
      <View style={styles.documents}>
        {singleDocument ? (
          <TermsDocumentCard document={singleDocument} showTitle={false} />
        ) : (
          settingsTermsDocumentIds.map((id) => <TermsDocumentCard key={id} document={termsDocuments[id]} />)
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  documents: {
    gap: spacing.sm,
  },
});
