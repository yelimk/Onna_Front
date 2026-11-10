import { Stack } from 'expo-router';
import { Fragment } from 'react';

import { ToastHost } from '@/components/toast';
import { UploadDraftProvider } from '@/features/upload/upload-draft';

export default function Layout() {
  return (
    <UploadDraftProvider>
      <Fragment>
        <Stack screenOptions={{ headerShown: false }} />
        {/* 남기기는 루트 위를 덮는 전체 화면 창이라 루트 토스트가 가려진다. 여기 토스트 자리를 따로 둔다 (얼굴·위치 거절 안내) */}
        <ToastHost />
      </Fragment>
    </UploadDraftProvider>
  );
}
