import { useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

const deniedLabel = '허용 안 함';

/*
 * 알림 권한은 expo-notifications로 묻는다. Android Expo Go는 불러오기만 해도 '푸시 미지원' 경고를 띄워서,
 * 파일 맨 위가 아니라 쓰는 순간에 불러온다 (features/auth/utils/request-app-permissions.ts와 같은 이유).
 */
async function getNotificationGranted() {
  const Notifications = await import('expo-notifications');
  const { granted } = await Notifications.getPermissionsAsync();
  return granted;
}

/**
 * 설정 화면에 보여줄 위치·카메라·알림 권한의 실제 상태. 서버가 아니라 휴대폰에 직접 묻는다.
 * 권한은 휴대폰 설정에서만 바꿀 수 있어서, 설정에 갔다가 앱으로 돌아오면 다시 물어 글자를 맞춘다.
 * 묻는 중에는 글자를 비워 둔다.
 */
export function usePermissionLabels() {
  const [locationPermission, , getLocationPermission] = Location.useForegroundPermissions();
  const [cameraPermission, , getCameraPermission] = useCameraPermissions();
  const [notificationGranted, setNotificationGranted] = useState<boolean>();

  useEffect(() => {
    const checkNotification = () => getNotificationGranted().then(setNotificationGranted).catch(() => undefined);
    checkNotification();

    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      getLocationPermission();
      getCameraPermission();
      checkNotification();
    });
    return () => subscription.remove();
  }, [getLocationPermission, getCameraPermission]);

  const labelOf = (granted: boolean | undefined, grantedLabel: string) => {
    if (granted === undefined) return '';
    return granted ? grantedLabel : deniedLabel;
  };

  return {
    location: labelOf(locationPermission?.granted, '앱 사용중'),
    camera: labelOf(cameraPermission?.granted, '허용됨'),
    notification: labelOf(notificationGranted, '허용됨'),
  };
}
