import { initialWindowMetrics, useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * 화면 위(시계·배터리 줄)와 아래(홈 막대)를 비울 높이.
 * 아이폰에서 아래에서 올라오는 창(남기기)은 올라오는 도중에 안전 영역을 재서, 가끔 위를 0으로 잘못 재고 그대로 남는다(QA).
 * 그래서 앱을 켤 때 잰 값(initialWindowMetrics)보다 작게는 비우지 않는다. 세로 화면만 쓰는 앱이라 켤 때 값이 늘 맞다.
 */
export function useScreenInsets() {
  const insets = useSafeAreaInsets();
  const launch = initialWindowMetrics?.insets;
  return {
    top: Math.max(insets.top, launch?.top ?? 0),
    bottom: Math.max(insets.bottom, launch?.bottom ?? 0),
  };
}
