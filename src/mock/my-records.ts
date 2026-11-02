/** 기록 탭 '지도' 보기(Figma 보류)에 쓰는 가짜 구역. 내 기록 목록은 서버에서 받는다 (hooks/use-my-posts.ts). */

import type { MapArea } from '@/types/map-area';

/** 내 기록 지도: 구역별로 묶인 내 기록 */
export const mockMyRecordAreas: MapArea[] = [
  { id: 'a1', name: '정문 앞', count: 5, hashtags: ['#덤', '#학교앞분식', '#붕어빵'], position: { top: '18%', left: '10%' } },
  { id: 'a2', name: '러브로드', count: 3, hashtags: ['#공강벤치', '#단골자리', '#노을'], position: { top: '28%', left: '76%' } },
  { id: 'a3', name: '중앙도서관', count: 2, hashtags: ['#말없이챙겨준', '#혼자만의자리'], position: { top: '64%', left: '45%' } },
  { id: 'a4', name: 'E동', count: 2, hashtags: ['#과방', '#자판기'], position: { top: '72%', left: '77%' } },
];
