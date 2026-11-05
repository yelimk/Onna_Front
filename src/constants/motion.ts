import { Easing } from 'react-native-reanimated';

/**
 * 애니메이션 시간(ms). 화면마다 따로 숫자를 쓰면 움직임의 리듬이 제각각이 되므로 여기 이름을 쓴다.
 * 이름 옆에 Figma 프로토타입 설정을 적었다. Figma에 없는 것(fast, normal)은 눌렀을 때 바로 반응한다고 느껴지는 짧은 값으로 정했다.
 */
export const duration = {
  /** 목록 줄을 누르고 있을 때 회색으로 바뀌는 시간 (Figma 마이 list_m pressed: 80ms) */
  listPress: 80,
  /** 버튼을 누르거나, 카드·체크를 고를 때 모양이 바뀌는 시간 (Figma 버튼 pressed, selectbox, checkbox: 디졸브 100ms) */
  press: 100,
  /** 버튼·이름표처럼 작은 것이 사라지거나 나타날 때 (Figma에 없음, 지도에서 씀) */
  fast: 150,
  /** 좋아요, 알림 종, 입력칸 빨간 테두리, 삭제 확인 창 (Figma: 180ms) */
  change: 180,
  /** 토스트가 나타나거나 사라질 때 (Figma 로그인 오류 토스트: 200ms) */
  toast: 200,
  /** 창·패널처럼 큰 것이 들어오거나 나갈 때 (Figma에 없음, 지도에서 씀) */
  normal: 250,
  /** 다음 장(단계)으로 넘어갈 때 (Figma 소개·설문·회원가입 '다음': 300ms) */
  screen: 300,
  /** 소개 그림이 둥둥 떠 있을 때 한 번 올라가거나 내려가는 시간 (Figma 온보딩 지연 후 전환: 1200ms) */
  float: 1200,
} as const;

// Figma 곡선 3가지. Figma가 쓰는 값(CSS 기본 곡선과 같음)을 그대로 옮겼다.
/** Figma 'Ease out': 빠르게 시작해서 천천히 멈춘다. Figma 프로토타입 대부분이 이 곡선이다 */
export const easeOut = Easing.bezier(0, 0, 0.58, 1);
/** Figma 'Ease in': 천천히 시작해서 빠르게 끝난다. 사라질 때 쓴다 */
export const easeIn = Easing.bezier(0.42, 0, 1, 1);
/** Figma 'Ease in and out': 천천히 시작해서 천천히 멈춘다 */
export const easeInOut = Easing.bezier(0.42, 0, 0.58, 1);

/** Figma 스프링 'Gentle' (질량 1, 강도 100, 감쇠 15). 회원가입 '사용할 수 있어요'에 쓴다 */
export const gentleSpring = { mass: 1, stiffness: 100, damping: 15 } as const;
