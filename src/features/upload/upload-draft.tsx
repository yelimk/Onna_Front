import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

import type { MyLocation, Tag } from '@/types/api';

/** 남기기 1~3단계가 같이 쓰는 임시 기록. 마지막 단계에서 서버로 보낸 뒤 버린다. */
export type UploadDraft = {
  /** 찍은 사진의 파일 주소. 세로 3:4, 1080×1440으로 맞춘 사진이다 (utils/normalize-photo.ts). */
  photoUri?: string;
  /** 셔터를 누른 순간의 위치. 사진 EXIF가 아니라 이 값을 서버에 보낸다 (PRD SAFE-07) */
  location?: MyLocation;
  /** 위치 확인 화면에 보여줄 동네 이름 (정확한 좌표는 서버가 흐려서 저장한다) */
  placeLabel: string;
  /** 서버가 준 남기기 질문. id는 태그 추천과 업로드에 같이 보낸다 */
  questionId?: number;
  question?: string;
  /** GUI에는 있지만 서버에 아직 제목 필드가 없어서 보내지 않는다 (백엔드와 정할 것) */
  title: string;
  /** 한 줄 코멘트 */
  oneLine: string;
  /** AI 후보에서 고른 태그 (최대 3개) */
  hashtags: Tag[];
};

type UploadDraftContextValue = {
  draft: UploadDraft;
  updateDraft: (patch: Partial<UploadDraft>) => void;
};

const UploadDraftContext = createContext<UploadDraftContextValue | null>(null);

// 동네 이름을 못 받았을 때 보여줄 이름
export const defaultPlaceLabel = '지금 이 자리';

/** 남기기 화면 묶음(app/upload/_layout.tsx)을 감싸서, 세 화면이 같은 임시 기록을 보게 한다 */
export function UploadDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<UploadDraft>({
    placeLabel: defaultPlaceLabel,
    title: '',
    oneLine: '',
    hashtags: [],
  });

  // 질문 불러오기 훅이 effect 의존값으로 써서, 그릴 때마다 새 함수가 되지 않게 고정한다
  const updateDraft = useCallback(
    (patch: Partial<UploadDraft>) => setDraft((prev) => ({ ...prev, ...patch })),
    [],
  );

  return <UploadDraftContext.Provider value={{ draft, updateDraft }}>{children}</UploadDraftContext.Provider>;
}

export function useUploadDraft() {
  const value = useContext(UploadDraftContext);
  if (!value) {
    throw new Error('useUploadDraft는 UploadDraftProvider 안에서만 쓸 수 있어요');
  }
  return value;
}
