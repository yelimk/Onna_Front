import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Badge } from '@/components/badge';
import { Button } from '@/components/button';
import { Icon } from '@/components/icon';
import { ScreenContainer } from '@/components/screen-container';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/layout';
import { DraftPhoto } from '@/features/upload/components/draft-photo';
import { UploadChecklist } from '@/features/upload/components/upload-checklist';
import { UploadStepHeader } from '@/features/upload/components/upload-step-header';
import { useSubmitPost } from '@/features/upload/hooks/use-submit-post';
import { useUploadDraft } from '@/features/upload/upload-draft';
import { formatHashtag } from '@/utils/format-hashtag';

const locationPin = require('@/assets/icons/location-pick.svg');

/**
 * ② 기록 탭: 남기기 3/3 위치 확인.
 * 집 위치 같은 개인정보가 드러나지 않게 정확한 좌표 대신 장소 이름(반경)으로 저장한다.
 * 회색 칸은 나중에 작은 지도로 바꾼다. 새로고침 버튼은 서버가 위치가 부정확하다고 할 때 위치를 다시 잡는다.
 * '기록 완료'에서 draft를 서버로 보낸다. 제목은 서버에 아직 칸이 없어서 보내지 않는다.
 */
export function ConfirmScreen() {
  const { draft } = useUploadDraft();
  const { canSubmit, isSubmitting, isLocating, relocate, submit } = useSubmitPost();

  return (
    <ScreenContainer
      contentTopGap={spacing.sm}
      header={<UploadStepHeader title="위치 확인" step={3} />}
      footer={
        <Button
          label={isSubmitting ? '올리는 중…' : '기록 완료'}
          variant="primary"
          disabled={!canSubmit}
          onPress={submit}
        />
      }>
      <AppText variant="heading03" style={styles.title}>
        이 자리에 남길게요
      </AppText>

      <View style={styles.mapBox}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="위치 다시 찾기"
          disabled={isLocating}
          onPress={relocate}
          style={styles.reload}>
          <Icon name="reload" />
        </Pressable>
        <View style={styles.pin}>
          <Badge label={draft.placeLabel} tone="dark" />
          <Image source={locationPin} style={styles.pinImage} contentFit="contain" />
        </View>
      </View>

      <View style={styles.preview}>
        <DraftPhoto uri={draft.photoUri} width={100} height={100} />
        <View style={styles.previewTexts}>
          <AppText variant="subtitle02" numberOfLines={1}>
            {draft.title || '제목'}
          </AppText>
          <AppText variant="body01" numberOfLines={2}>
            {draft.oneLine || '한 줄을 아직 쓰지 않았어요'}
          </AppText>
          <AppText variant="caption04" color="textTertiary">
            {draft.hashtags.map((tag) => formatHashtag(tag.name)).join(' ')}
          </AppText>
        </View>
      </View>

      <UploadChecklist />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.xl,
  },
  mapBox: {
    height: 145,
    borderRadius: radius.lg,
    backgroundColor: colors.uploadMapBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 지도 위 떠 있는 버튼(IconButton)과 달리 그림자 없이 옅은 회색 동그라미 (Figma reload_circle)
  reload: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.softCircleButton,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pin: {
    alignItems: 'center',
  },
  // Figma location_pick은 그림자까지 포함한 크기라 핀 본체(38x45)보다 조금 크다
  pinImage: {
    width: 45,
    height: 53,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: spacing.xl,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderDeactivated,
  },
  previewTexts: {
    flex: 1,
  },
});
