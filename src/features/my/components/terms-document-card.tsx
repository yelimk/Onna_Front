import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/layout';
import type { TermsDocument } from '@/constants/terms';

type TermsDocumentCardProps = {
  document: TermsDocument;
  /** 문서 하나만 볼 때는 머리글에 제목이 있어서 카드 안 제목을 숨긴다 */
  showTitle?: boolean;
};

/**
 * 약관 문서 하나를 흰 카드에 보여준다. Figma 약관 화면은 제목만 있고 본문 디자인이 없어서,
 * 설정 화면 카드(회색 배경 위 흰 카드, 모서리 12)와 같은 모양에 디자인 시스템 글씨를 썼다.
 */
export function TermsDocumentCard({ document, showTitle = true }: TermsDocumentCardProps) {
  return (
    <View style={styles.card}>
      {showTitle && <AppText variant="subtitle03">{document.title}</AppText>}
      <View style={styles.items}>
        {document.items.map((item) => (
          <View key={item} style={styles.item}>
            <AppText variant="body02" color="textSecondary">
              ·
            </AppText>
            <AppText variant="body02" color="textSecondary" style={styles.itemText}>
              {item}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.background01,
  },
  items: {
    gap: spacing.xs,
  },
  // 글이 두 줄 넘어가도 둘째 줄이 점 아래로 가지 않게 점과 글을 나눈다
  item: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  itemText: {
    flex: 1,
  },
});
