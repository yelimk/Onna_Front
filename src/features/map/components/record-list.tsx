import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Icon } from '@/components/icon';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/layout';
import { RecordPhoto } from '@/features/map/components/record-photo';

/** 목록 한 줄에 필요한 것만. 묶음 기록과 지도 기록(PhotoMarker) 모두 이 모양을 가진다. */
type ListedRecord = {
  id: string;
  hashtags: string[];
  /** 서버가 흐림 단계에 맞춰 흐리게 만든 사진. 없으면 회색 상자 */
  imageUrl?: string;
};

type RecordListProps<Record extends ListedRecord> = {
  records: Record[];
  onPress: (record: Record) => void;
};

const thumbnailSize = 36;

/** 기록 목록: 작은 사진, 해시태그, 오른쪽 화살표. 묶음 기록과 길안내의 '범위 내 기록들'이 같이 쓴다. */
export function RecordList<Record extends ListedRecord>({ records, onPress }: RecordListProps<Record>) {
  return (
    <View>
      {records.map((record, index) => (
        <View key={record.id}>
          {index > 0 && <View style={styles.divider} />}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={record.hashtags.join(' ')}
            onPress={() => onPress(record)}
            style={styles.row}>
            <RecordPhoto imageUrl={record.imageUrl} width={thumbnailSize} height={thumbnailSize} style={styles.thumbnail} />
            <View style={styles.hashtags}>
              {record.hashtags.map((hashtag) => (
                <AppText key={hashtag} variant="button03" color="textSecondary">
                  {hashtag}
                </AppText>
              ))}
            </View>
            <Icon name="forward" size={24} color="textDeactivated" />
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  thumbnail: {
    borderRadius: radius.sm,
  },
  hashtags: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderDeactivated,
  },
});
