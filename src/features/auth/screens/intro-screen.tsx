import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { ScreenContainer } from '@/components/screen-container';
import { sectionGap, spacing } from '@/constants/layout';
import { easeInOut } from '@/constants/motion';
import { IntroDots } from '@/features/auth/components/intro-dots';
import { IntroIllustration } from '@/features/auth/components/intro-illustration';
import { StepTransition } from '@/features/auth/components/step-transition';
import { introSlides } from '@/features/auth/constants/intro-slides';
import { markIntroSeen } from '@/features/auth/utils/intro-seen';

/**
 * 시작: 서비스 소개 3장. 처음 설치했을 때만 나오고, 마지막 장에서 '다음'을 누르면 로그인으로 간다.
 * '다음'을 누르면 그림과 글이 300ms 동안 다음 장으로 서서히 바뀐다 (Figma 프로토타입: 스마트 애니메이트 300ms, Ease in and out).
 * 마지막 장에서 로그인으로 가는 움직임(Figma 슬라이드 인 300ms)은 휴대폰 기본 화면 넘김이라 Figma 값으로 바꿀 수 없다.
 */
export function IntroScreen() {
  const [slideIndex, setSlideIndex] = useState(0);
  const slide = introSlides[slideIndex];
  const isLastSlide = slideIndex === introSlides.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      markIntroSeen();
      // 다시 볼 일이 없는 화면이라 뒤로 가기로 돌아오지 않게 바꿔 끼운다
      router.replace('/login');
      return;
    }
    setSlideIndex(slideIndex + 1);
  };

  return (
    <ScreenContainer
      footer={
        <>
          <View style={styles.dots}>
            <IntroDots count={introSlides.length} activeIndex={slideIndex} />
          </View>
          <Button label="다음" variant="primary" onPress={handleNext} />
        </>
      }>
      {/* 첫 장은 앱을 켤 때 바로 보이게 움직이지 않는다 */}
      <StepTransition stepKey={slideIndex} animate={slideIndex > 0} easing={easeInOut} style={styles.content}>
        <View style={styles.illustration}>
          <IntroIllustration name={slide.illustration} />
        </View>
        <View style={styles.texts}>
          <AppText variant="heading01" style={styles.center}>
            {slide.title}
          </AppText>
          <AppText variant="subtitle03" color="textSecondary" style={styles.center}>
            {slide.description}
          </AppText>
        </View>
      </StepTransition>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xxxl,
  },
  // 장마다 그림 크기가 달라도 글자 위치가 흔들리지 않게 그림 칸 높이를 고정한다
  illustration: {
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    gap: spacing.md,
  },
  center: {
    textAlign: 'center',
  },
  // Figma 온보딩: 점과 '다음' 버튼 사이 40
  dots: {
    marginBottom: sectionGap,
  },
});
