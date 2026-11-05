import { Image } from 'expo-image';
import { StyleSheet, View, type ImageStyle, type ViewStyle } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { Badge } from '@/components/badge';
import { spacing } from '@/constants/layout';
import { BlurPhoto } from '@/features/auth/components/blur-photo';
import type { IntroIllustrationName } from '@/features/auth/constants/intro-slides';
import { useFloatProgress } from '@/features/auth/hooks/use-float-progress';

const searchImage = require('@/assets/images/onboarding/intro-search.png');
const bookImage = require('@/assets/images/onboarding/intro-book.png');
// Figma는 SVG 흐림 효과(blur)로 그렸지만 폰에서는 SVG 흐림이 안 먹어서 딱딱한 타원이 된다. 그래서 미리 흐리게 만든 PNG를 쓴다.
const glowImage = require('@/assets/images/onboarding/intro-glow.png');

/*
 * Figma 애니메이션 프레임(처음 → 끝)에서 옮긴 움직임 거리.
 * 1장: 두 사진이 함께 20 올라갔다 내려온다.
 * 2·3장: 그림이 아래로 10 내려오면 그림자가 위로 다가오며 진해지고, 그림이 올라가면 그림자가 멀어지며 옅어진다 (그림자 멀어지는 애니메이션).
 */
const photoRise = 20;
const objectDrop = 10;
const searchGlowRise = 20;
const bookGlowRise = 10;
// Figma는 그림이 멀 때 그림자를 더 흐리게 그렸다. 흐림 정도는 움직일 수 없어서 옅어지고 넓어지는 것으로 바꿨다.
const farGlowOpacity = 0.6;
const farGlowScale = 1.15;

/*
 * 그림 칸 아래 끝에서 그림자 가운데까지 거리 (Figma 처음 프레임에서 잰 값).
 * 돋보기는 Figma에서 11도 돌린 그림이라 겉 상자(215)가 그림 칸(182)보다 커서, 그림 칸 가운데를 기준으로 다시 쟀다.
 * 돋보기: 그림 가운데 → 그림자 가운데 137, 그림 칸 절반 91 → 46
 * 책: 그림 아래 끝(401) → 그림자 가운데(431.5) → 30
 */
const searchGlowGap = 46;
const bookGlowGap = 30;
// 그림자 그림(PNG)은 흐림이 퍼진 자리까지 담아서 높이가 79이고, 그림자 가운데는 그 절반(39.5)에 있다
const glowHalfHeight = 79 / 2;

type IntroIllustrationProps = {
  name: IntroIllustrationName;
};

/** 소개 화면 위쪽 그림. 장마다 GUI 일러스트가 다르고, 셋 다 둥둥 떠 있다 (Figma 애니메이션 온보딩1). */
export function IntroIllustration({ name }: IntroIllustrationProps) {
  const progress = useFloatProgress();

  if (name === 'search' || name === 'book') {
    return (
      <FloatingObject
        progress={progress}
        source={name === 'search' ? searchImage : bookImage}
        imageStyle={name === 'search' ? styles.search : styles.book}
        glowRise={name === 'search' ? searchGlowRise : bookGlowRise}
        glowGap={name === 'search' ? searchGlowGap : bookGlowGap}
      />
    );
  }

  return <FloatingPhotos progress={progress} />;
}

type FloatingObjectProps = {
  progress: SharedValue<number>;
  source: number;
  imageStyle: ImageStyle;
  glowRise: number;
  glowGap: number;
};

/** 돋보기·책처럼 그림 하나와 그 아래 주황 그림자. 그림이 내려오면 그림자가 다가와 진해진다 */
function FloatingObject({ progress, source, imageStyle, glowRise, glowGap }: FloatingObjectProps) {
  const objectStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(progress.get(), [0, 1], [0, objectDrop]) }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.get(), [0, 1], [farGlowOpacity, 1]),
    transform: [
      { translateY: interpolate(progress.get(), [0, 1], [0, -glowRise]) },
      { scaleX: interpolate(progress.get(), [0, 1], [farGlowScale, 1]) },
    ],
  }));

  return (
    <View style={styles.center}>
      <Animated.View style={objectStyle}>
        <Image source={source} style={imageStyle} />
      </Animated.View>
      <Animated.View style={[{ marginTop: glowGap - glowHalfHeight }, glowStyle]}>
        <Image source={glowImage} style={styles.glow} />
      </Animated.View>
    </View>
  );
}

/** 1장: 해시태그가 붙은 흐린 사진 두 장이 함께 떠 있다 */
function FloatingPhotos({ progress }: { progress: SharedValue<number> }) {
  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(progress.get(), [0, 1], [0, -photoRise]) }],
  }));

  return (
    <Animated.View style={[styles.blurPhotos, floatStyle]}>
      <HashtagPhoto size={97} hashtag="#골목속장미" style={styles.smallPhoto} />
      <HashtagPhoto size={118} hashtag="#말없이챙겨준" style={styles.largePhoto} />
    </Animated.View>
  );
}

type HashtagPhotoProps = {
  size: number;
  hashtag: string;
  style: ViewStyle;
};

function HashtagPhoto({ size, hashtag, style }: HashtagPhotoProps) {
  return (
    <View style={[styles.hashtagPhoto, style]}>
      <BlurPhoto size={size} />
      <Badge label={hashtag} style={styles.hashtag} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
  },
  search: {
    width: 182,
    height: 182,
    transform: [{ rotate: '-11deg' }],
  },
  glow: {
    width: 174,
    height: 79,
  },
  book: {
    width: 210,
    height: 210,
  },
  // 두 사진을 비스듬히 겹쳐 놓으려고 Figma 배치 비율대로 절대 위치를 쓴다
  blurPhotos: {
    width: 240,
    height: 250,
  },
  smallPhoto: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  largePhoto: {
    position: 'absolute',
    top: 97,
    right: 0,
  },
  hashtagPhoto: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  hashtag: {
    alignSelf: 'center',
  },
});
