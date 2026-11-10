/**
 * 백엔드 서버 주소. 명세서(온나 API 명세)의 주소를 기본값으로 두고, 도메인·HTTPS가 생기면 .env의
 * EXPO_PUBLIC_API_URL로 바꾼다. 비밀 값이 아니라서 .env가 없어도 기본값으로 동작하게 둔다.
 */
export const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://3.25.22.156/api/v1';
