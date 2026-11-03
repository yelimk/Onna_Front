import { Image } from 'expo-image';
import { StyleSheet, View, type DimensionValue, type ViewStyle } from 'react-native';

import { PhotoPlaceholder } from '@/components/photo-placeholder';
import { radius } from '@/constants/layout';

type RecordPhotoProps = {
  /** 서버 사진 주소. 없거나(아직 못 받음·잠김) 불러오지 못하면 흐린 회색 상자로 대신한다. */
  imageUrl?: string;
  width: DimensionValue;
  height: DimensionValue;
  style?: ViewStyle;
};

/**
 * 지도 기능의 기록 사진. 서버가 흐림 단계에 맞춰 흐리게 만든 사진을 그대로 보여준다.
 * 주소가 5분 뒤 만료되어 같은 사진도 주소가 바뀌므로, 캐시는 주소 기준으로 둔다.
 */
export function RecordPhoto({ imageUrl, width, height, style }: RecordPhotoProps) {
  if (!imageUrl) return <PhotoPlaceholder width={width} height={height} style={style} />;
  return (
    <View style={[styles.photo, { width, height }, style]}>
      <Image source={{ uri: imageUrl }} contentFit="cover" style={StyleSheet.absoluteFill} />
    </View>
  );
}

const styles = StyleSheet.create({
  // PhotoPlaceholder와 같은 모서리라서, 사진이 들어와도 자리 모양이 바뀌지 않는다.
  photo: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
});
