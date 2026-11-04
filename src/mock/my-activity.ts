/** 좋아요 내역·연 자리 기록의 '지도' 보기 예시. Figma에서 지도 보기가 보류라 와이어프레임 회색 지도에 이 구역들을 그린다. */

import type { MapArea } from '@/types/map-area';

export const mockLikedAreas: MapArea[] = [
  { id: 'l1', name: 'E동 뒤 골목', count: 3, hashtags: ['#말없이챙겨준', '#국밥집', '#단골'], position: { top: '20%', left: '14%' } },
  { id: 'l2', name: '학교 앞', count: 3, hashtags: ['#덤', '#떡집', '#붕어빵'], position: { top: '62%', left: '30%' } },
  { id: 'l3', name: '러브로드', count: 2, hashtags: ['#공강벤치', '#노을'], position: { top: '30%', left: '72%' } },
  { id: 'l4', name: '민속촌 근처', count: 1, hashtags: ['#밥뭇나'], position: { top: '70%', left: '76%' } },
];
