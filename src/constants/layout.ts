import { palette } from '@/constants/colors';

/**
 * 간격과 모서리 값. Figma 디자인 시스템에는 아직 없어서 GUI 화면에 쓰인 값으로 정했다.
 * 화면에서 margin, padding, borderRadius 숫자를 직접 쓰지 말고 여기 이름을 쓴다.
 */

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

/** 화면 좌우 여백 (Figma GUI 화면 기준 20) */
export const screenPaddingX = spacing.lg;

/** 제목 덩어리와 본문 덩어리 사이처럼 큰 묶음 사이 간격 (Figma 온보딩 gap 40) */
export const sectionGap = 40;

/**
 * 스플래시 로고(핀·온나·'가까이 가면, 보여요') 그림 크기. Figma 스플래쉬 화면 로고 묶음 141×98에 사방 8을 더해 자른 그림이다.
 * app.json expo-splash-screen의 imageWidth(157)와 같아야 기본 스플래시에서 시작 화면으로 넘어갈 때 로고가 그대로 있다.
 */
export const splashLogoSize = { width: 157, height: 114 } as const;

/** 지도 위에 떠 있는 카드·버튼의 그림자 */
export const floatingShadow = {
  shadowColor: palette.gray.black,
  shadowOpacity: 0.1,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 4,
} as const;

/** 흰 바탕 위 동그라미 버튼의 옅은 그림자 (Figma 마이 알림 종 bell_circle: drop shadow 0 0 16, 검정 8%) */
export const softShadow = {
  shadowColor: palette.gray.black,
  shadowOpacity: 0.08,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 0 },
  elevation: 3,
} as const;

/** 소개·설문 완료 그림의 흐린 사진 카드 그림자 (Figma drop shadow 0 0 12, 검정 16%) */
export const photoShadow = {
  shadowColor: palette.gray.black,
  shadowOpacity: 0.16,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 0 },
  elevation: 4,
} as const;

/** 화면 위에 잠깐 뜨는 토스트 알림 (Figma drop shadow 0 4 10, 검정 25%) */
export const toastShadow = {
  shadowColor: palette.gray.black,
  shadowOpacity: 0.25,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 6,
} as const;

/** 설문 완료의 주황 테두리 사진은 더 떠 보이게 그림자를 진하게 (Figma blur_color, 검정 32%) */
export const highlightedPhotoShadow = {
  ...photoShadow,
  shadowOpacity: 0.32,
  elevation: 8,
} as const;
