import { Easing } from 'react-native-reanimated';

/**
 * 애니메이션 시간(ms). Figma 프레임에는 시간이 들어 있지 않아서, 눌렀을 때 바로 반응한다고 느껴지는 짧은 값으로 정했다.
 * 화면마다 따로 숫자를 쓰면 움직임의 리듬이 제각각이 되므로 여기 이름을 쓴다.
 * Figma 프로토타입에 시간이 정해진 움직임은 그 값을 그대로 옮겼다 (screen, float).
 */
export const duration = {
  /** 버튼·이름표처럼 작은 것이 사라지거나 나타날 때 */
  fast: 150,
  /** 창·패널처럼 큰 것이 들어오거나 나갈 때 */
  normal: 250,
  /** '다음'을 눌러 다음 장(단계)으로 넘어갈 때 (Figma 온보딩 '다음' 버튼: 스마트 애니메이션 300ms) */
  screen: 300,
  /** 소개 그림이 둥둥 떠 있을 때 한 번 올라가거나 내려가는 시간 (Figma 온보딩 지연 후 전환: 1200ms) */
  float: 1200,
} as const;

/** Figma 'Ease in and out' 곡선. 천천히 시작해서 천천히 멈춘다 */
export const easeInOut = Easing.bezier(0.42, 0, 0.58, 1);
