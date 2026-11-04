import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { getMyLikes, getMyOpens } from '@/api/users';
import { setLikedSpotIds } from '@/features/my/hooks/use-liked-spots';
import { mockLikedSpots, mockOpenedSpots } from '@/mock/my-spots';
import type { LikedSpot, OpenedSpot } from '@/types/api';
import type { PhotoSource } from '@/types/photo-source';
import { formatHashtag } from '@/utils/format-hashtag';

/** 좋아요 내역·연 자리 기록의 한 줄 (Figma list_l, list_m) */
export type MySpotItem = {
  postId: number;
  title: string;
  hashtags: string[];
  photo: PhotoSource;
  /** 좋아요한 날 또는 연 날 */
  date: string;
};

/*
 * 상세 화면은 목록에서 누른 줄을 그대로 보여준다. 한 장씩 받는 API가 없어서, 목록에서 받은 값을 여기 담아 두고 꺼내 쓴다.
 * 사진 주소가 30분 뒤 만료돼서 목록 화면에 들어올 때마다 다시 받아 덮어쓴다.
 */
const spotsById = new Map<number, MySpotItem>();

/** 목록에서 담아 둔 한 줄 */
export function findMySpot(postId: number) {
  return spotsById.get(postId);
}

function toItem(spot: OpenedSpot | LikedSpot, date: string): MySpotItem {
  const item = {
    postId: spot.postId,
    title: spot.title,
    hashtags: spot.tags.map(formatHashtag),
    photo: { uri: spot.imageUrl },
    date,
  };
  spotsById.set(item.postId, item);
  return item;
}

/** 내가 연 자리 (최근에 연 순서). spots가 null이면 아직 불러오는 중이다 */
export function useOpenedSpots() {
  const [spots, setSpots] = useState<MySpotItem[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      getMyOpens()
        .then((result) => {
          // 비어 있으면 예시를 대신 보여준다 (시연 전에 지운다, mock/my-spots.ts)
          const spots = result.length === 0 ? mockOpenedSpots : result;
          setSpots(spots.map((spot) => toItem(spot, spot.openedAt)));
        })
        .catch(() => setSpots([]));
    }, []),
  );

  return spots;
}

/**
 * 내가 좋아요한 자리 (최근에 누른 순서). 받은 목록으로 좋아요 상태(use-liked-spots)도 맞춘다.
 * 목록은 화면에 들어올 때만 받아서, 그 안에서 하트를 취소해도 줄이 빠지지 않고 빈 하트로 남는다 (팀 결정).
 */
export function useLikedSpotList() {
  const [spots, setSpots] = useState<MySpotItem[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      getMyLikes()
        .then((result) => {
          // 비어 있으면 예시를 대신 보여준다 (시연 전에 지운다, mock/my-spots.ts)
          const spots = result.length === 0 ? mockLikedSpots : result;
          setSpots(spots.map((spot) => toItem(spot, spot.likedAt)));
          setLikedSpotIds(spots.map((spot) => spot.postId));
        })
        .catch(() => setSpots([]));
    }, []),
  );

  return spots;
}
