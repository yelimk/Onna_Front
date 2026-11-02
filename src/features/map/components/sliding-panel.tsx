import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';

import { duration } from '@/constants/motion';

/*
 * Figma '지도 검색 애니메이션', '지도 검색 결과에서 경로 탐색까지 애니메이션':
 * 아래 패널이 바뀔 때 이전 패널이 먼저 내려가고, 지도만 잠깐 보인 뒤 새 패널이 올라온다.
 * 웹은 직접 만든 등장 애니메이션을 지원하지 않아서 기본 애니메이션을 쓴다.
 */
const panelExiting = SlideOutDown.duration(duration.fast);
const panelEntering = SlideInDown.duration(duration.normal).delay(duration.fast);

type SlidingPanelProps = {
  children: ReactNode;
};

/**
 * 아래 패널(목록, 장소 카드, 경로 카드)을 감싸 올라오고 내려가게 한다.
 * 화면이 이 부품에 패널마다 다른 key를 주면, key가 바뀔 때 이전 것은 내려가고 새 것이 올라온다.
 * 패널은 화면 아래에 붙어 있어서, 화면 전체를 덮는 층째로 움직인다.
 */
export function SlidingPanel({ children }: SlidingPanelProps) {
  return (
    <Animated.View entering={panelEntering} exiting={panelExiting} style={styles.layer}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // 패널이 없는 빈 곳의 터치는 아래 지도로 넘긴다.
  layer: {
    ...StyleSheet.absoluteFill,
    pointerEvents: 'box-none',
  },
});
