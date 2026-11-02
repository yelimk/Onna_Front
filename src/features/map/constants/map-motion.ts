import { duration } from '@/constants/motion';

/** 검색을 열 때 지도 위 버튼·이름표·탭 바가 사라지는 시간 */
export const mapChromeFadeMs = duration.fast;

/** 검색 창이 위에서 내려오는 시간. 지도 위 버튼이 먼저 사라진 뒤(mapChromeFadeMs) 내려온다. */
export const searchPanelEnterMs = duration.normal;
