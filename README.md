# 온나 (Onna) 프론트엔드

<!-- 팀원, 역할은 팀에서 함께 작성 예정 -->

## 프로젝트 설명

온나는 대구·경북의 **속정**(겉은 무뚝뚝해도 속으로 상대를 챙기는 마음)을 사진과 한 줄로 남기고, 다른 사람이 남긴 자리에 걸어가 열어 보는 앱입니다.

| 기능 | 설명 |
|---|---|
| 남기기 | 앱 카메라로 찍은 사진에 제목과 한 줄을 붙여 그 자리에 익명으로 남깁니다. AI가 한 줄을 읽고 해시태그를 추천합니다. |
| 늦게, 흐리게 닿기 | 남긴 기록은 24시간 뒤 다른 사람의 지도에 흐리게 나타나고, 그 자리에 가까이(25m) 가야 열립니다. |
| 검색과 산책 경로 | 장소·해시태그로 찾고, 고른 해시태그의 자리를 잇는 산책 경로와 길안내를 받습니다. |
| 내 기록 | 남긴 기록, 좋아요한 자리, 연 자리를 모아 보고, 내 기록이 열리면 알림으로 확인합니다. |
| 온보딩 | 이메일 로그인·회원가입, 권한 안내, 취향 설문(해시태그·걷는 유형)을 거칩니다. |

## 실행 방법

**준비물**: Node.js 22.13 이상, 폰에 Expo Go 앱

```bash
npm install
npx expo start
```

터미널의 QR 코드를 찍으면 Expo Go에서 앱이 열립니다. 아이폰은 기본 카메라로, 안드로이드는 Expo Go의 "Scan QR code"로 찍습니다. PC와 폰이 다른 와이파이라면 `npx expo start --tunnel`로 실행합니다.

> Windows PowerShell에서 `npx`가 막히면 `npx.cmd`를 씁니다.

**환경 변수**: `.env.example`을 복사해 `.env`를 만들고 키를 넣습니다. 키가 없어도 앱은 열리며, 지도는 회색 지도로, 산책 경로는 직선으로 대신 보입니다.

```bash
EXPO_PUBLIC_KAKAO_MAP_JS_KEY=   # 카카오 JavaScript 키 (지도)
EXPO_PUBLIC_KAKAO_REST_API_KEY= # 카카오 REST API 키 (장소 검색)
EXPO_PUBLIC_TMAP_APP_KEY=       # (선택) TMAP 앱 키 (실제 걷는 길)
EXPO_PUBLIC_API_URL=            # (선택) 서버 주소. 비우면 src/api/config.ts의 기본 주소
```

카카오 개발자 콘솔의 **JavaScript SDK 도메인**에 `http://localhost`를 등록해야 지도가 뜹니다. 앱 안의 지도 페이지가 이 주소로 열리기 때문입니다.

**검사**: 작업을 마치면 두 검사를 통과해야 합니다.

```bash
npx expo lint      # 코드 스타일
npx tsc --noEmit   # 타입
```

## 기술 스택

| 구분 | 사용 기술 |
|---|---|
| 프레임워크 | React Native 0.88, Expo SDK 58 |
| 언어 | TypeScript |
| 화면 이동 | Expo Router (파일 기반 라우팅) |
| 애니메이션 | react-native-reanimated |
| 지도 | 카카오맵 JavaScript SDK (react-native-webview 안에 띄움) |
| 외부 API | 카카오 로컬 API (장소 검색), TMAP 보행자 경로 API |
| 카메라·사진 | expo-camera, expo-image-manipulator, expo-file-system, expo-image |
| 위치·권한 | expo-location, expo-notifications (권한 요청만) |
| 기기 저장 | expo-secure-store (로그인 토큰), AsyncStorage (최근 검색 등) |
| 글꼴 | Pretendard (SIL OFL 1.1) |
| 배포 | EAS Update |
| 코드 검사 | ESLint, TypeScript |

라이브러리는 모두 MIT 라이선스이며, **Expo Go에 들어 있는 모듈만** 썼습니다. 팀 모두가 QR 하나로 바로 테스트하기 위해서입니다. 지도도 같은 이유로 앱용 카카오맵 SDK 대신 WebView 안에 JavaScript SDK를 띄웠습니다.

## 아키텍처

```
src/app/                  라우트. 파일마다 한 줄로 기능 폴더의 화면을 꺼냄
  ↓
src/features/<기능>/      화면(screens)과 그 기능만 쓰는 부품·훅·함수
  ↓
src/components, hooks, utils, constants   두 기능 이상이 같이 쓰는 것 (디자인 시스템 포함)
  ↓
src/api/                  서버 요청. 모든 요청은 client.ts를 거침
```

- **라우트와 화면 분리**: `src/app/`의 파일은 `export { MapScreen as default } from '@/features/map/screens/map-screen';` 한 줄입니다. 주소와 화면을 따로 바꿀 수 있습니다.
- **기능별 폴더**: 한 기능만 쓰는 코드는 그 기능 폴더에, 두 기능 이상이 쓰면 공통 폴더에 둡니다. 공통 폴더는 기능 폴더를 가져다 쓰지 않습니다.
- **화면은 그리기, 훅은 데이터**: 서버에서 받고, 다시 받고, 실패를 처리하는 일은 `use-*.ts` 훅이 맡고 화면은 결과만 그립니다.
- **서버 요청 한 곳**: `api/client.ts`가 토큰을 붙이고, 만료되면 한 번 새로 받아 다시 보내고, 오류를 `ApiError`로 바꿉니다. 다시 받기도 실패하면 어느 화면에서든 로그인 화면으로 보냅니다 (`hooks/use-session-expired-redirect.ts`).
- **디자인 값은 이름으로**: 색·글씨·간격·애니메이션 시간을 `src/constants/`에 두고 화면에서는 이름만 씁니다.

## 폴더 구조

```
src/
  app/            라우트 (Expo Router)
  features/
    auth/           시작, 소개, 로그인, 회원가입, 권한, 취향 설문
    map/            지도, 검색, 경로 추천, 길안내, 사진 카드, 카카오맵(kakao-map/)
    record/         내 기록 목록, 기록 상세
    upload/         남기기 (촬영 → 한 줄 → 위치 확인)
    my/             마이, 좋아요 내역, 연 자리 기록, 사용자 기호 설정, 설정, 약관
    notification/   알림 목록
  components/     공통 부품
  constants/      디자인 시스템, 약관 문장, 공통 보기 값
  hooks/          공통 훅
  api/            서버 요청
  mock/           서버 목록이 비었을 때 보여 주는 예시 데이터
  utils/          공통 함수 (날짜, 해시태그, 오류 토스트)
  types/          서버 데이터 타입
assets/           글꼴, Figma 아이콘(SVG), 이미지
```

기능 폴더 안은 `screens/`, `components/`, `hooks/`, `utils/`, `constants/`로 같은 모양입니다.

## 화면 구성

```
앱 시작 → (로그인 상태면 바로 지도) 소개 → 로그인 → 회원가입 → 권한 → 취향 설문 → 지도

아래 탭
├─ 지도  /map     검색 → 검색결과 → 경로 추천 → 길안내 → '열렸어요'
│                 묶음 목록, 사진 카드 /photo/[id]
├─ 기록  /record  기록 상세
└─ 마이  /my      알림, 좋아요 내역·연 자리 기록 → 상세, 사용자 기호 설정, 설정 → 약관

남기기  /upload/camera → write → confirm
```

## 주요 구현

**온보딩** (`features/auth`)
- 저장된 토큰이 있으면 로그인을 건너뛰고, 소개는 처음 설치한 사람에게만 보여 줍니다.
- 회원가입 오류는 칸을 떠날 때 보여 주고 고치면 바로 지웁니다 (`hooks/use-field-error-timing.ts`). 입력 규칙은 `utils/signup-rules.ts`에 모았습니다.

**지도** (`features/map`)
- 서버가 내 위치로 정한 흐림 단계(`S0`→`OPEN`)대로 사진을 보여 주고, 30m 걸을 때마다 다시 받습니다. 사진 주소가 30분 뒤 만료되므로 25분마다 다시 받습니다.
- 카카오맵 코드는 `kakao-map/`에 모았습니다. 마커는 HTML이라 디자인 시스템 값을 CSS로 바꿔 넣습니다.
- 경로 추천은 서버 AI 추천으로 들를 자리를 받고, TMAP으로 실제 걷는 길을 그립니다. 실패하면 앱이 직접 자리를 고르고 직선으로 잇습니다.

**남기기** (`features/upload`)
- 사진은 갤러리 권한 없이 앱 카메라로만 찍고, 세로 3:4·1080×1440으로 맞춥니다. 위치는 셔터를 누른 순간의 위치를 씁니다.
- 세 화면이 쓰는 값(사진, 위치, 제목, 한 줄, 해시태그)은 `upload-draft.tsx`의 Context에 모읍니다.
- 얼굴이 보이거나 위치 오차가 크면 서버 오류 코드에 따라 다시 찍기·다시 찾기를 안내합니다.

**기록·마이** (`features/record`, `my`, `notification`)
- 알림은 '5분 전', '작년'처럼 지금과의 차이로 묶습니다 (`utils/format-relative-time.ts`). 서버가 '새 알림' 표시를 주지 않아, 알림 화면을 마지막으로 본 시각을 폰에 저장해 빨간 점을 붙입니다.
- 기록 삭제, 회원 탈퇴처럼 되돌릴 수 없는 일은 확인 창(`ConfirmDialog`)을 거칩니다.

**공통**
- 서버 날짜는 시간대 없이 한국 시각으로 오므로 반드시 `utils/parse-server-date.ts`로 읽습니다.
- 서버 목록이 비어 있으면 `src/mock/`의 예시를 대신 보여 줍니다 (내 기록, 좋아요 내역, 연 자리 기록, 알림).

## 디자인 시스템

Figma 디자인 시스템의 값을 코드로 옮겼습니다.

| 파일 | 내용 |
|---|---|
| `constants/colors.ts` | 색상 (용도별 이름) |
| `constants/typography.ts`, `components/app-text.tsx` | 글씨 스타일과 글씨 부품 `AppText` |
| `constants/layout.ts` | 간격, 모서리 |
| `constants/motion.ts` | 애니메이션 시간과 곡선 (Figma 프로토타입 값) |

- 색은 `colors`의 이름으로, 글씨는 `Text` 대신 `AppText`로 씁니다. 어기면 ESLint 경고가 뜹니다.
- Figma 값 중 글씨·여백·모서리·색은 그대로, 화면 너비(390)와 고정 위치는 폰 크기에 맞게 바꿔 옮깁니다 (`AGENTS.md` "Figma 수치 옮기기").
- 화면은 공통 부품으로 먼저 조립합니다: `ScreenContainer`, `ScreenHeader`, `Button`, `TextField`, `Checkbox`, `Radio`, `Toggle`, `Chip`, `Badge`, `Icon`, `IconButton`, `SegmentedToggle`, `LikeButton`, `Toast`, `ConfirmDialog`, `LoadingSpinner`, `PressHighlight`, `PhotoPlaceholder`, `MapPlaceholder`, `AppTabBar`.

## 배포

- **개발 중 확인**: iOS·Android 모두 Expo Go로 확인합니다.
- **팀원 공유**: EAS Update로 올리고, 팀원은 Expo Go로 QR을 찍어 엽니다. 비공개 프로젝트라 Expo Go에 onna-app 팀 계정으로 로그인해야 하며, 안드로이드 Expo Go는 runtimeVersion이 `exposdk:58.0.0`인 업데이트만 엽니다. 앱 키는 Expo 서버 환경 변수에 있습니다.

```bash
npx eas-cli@latest update --branch develop --environment development --message "바뀐 내용"
```

- **제출용**: Android APK로 제출할 수 있습니다.

## FE 협업 방법

**브랜치**

| 브랜치 | 용도 |
|---|---|
| `main` | 시연·제출용 |
| `develop` | 작업을 모으는 곳. 앱이 깨지지 않는 것만 합칩니다 |
| `feature/이름-작업` | 각자 작업하는 곳 (예: `feature/yelim-design-3`) |

**작업 순서**
1. 최신 `develop`에서 `feature/이름-작업` 브랜치를 만듭니다.
2. 맡은 폴더에서 작업합니다. 공통 파일(`components/`, `constants/`, 라우트 설정, `package.json`)을 고칠 때는 먼저 상대에게 알립니다.
3. `npx expo lint`, `npx tsc --noEmit`을 통과하고 폰에서 열어 봅니다.
4. `develop`으로 PR을 올리고, 충돌이 있으면 `develop`을 내 브랜치에 합쳐 풉니다.
5. `develop` → `main`은 시연·제출 전에 함께 확인하고 합칩니다.

| 담당 | 폴더 |
|---|---|
| 지도 | `src/features/map` |
| 화면 | `src/features/auth`, `record`, `upload`, `my`, `notification` |

**코드 규칙** (자세한 내용은 [`AGENTS.md`](AGENTS.md))
- 파일은 `kebab-case`, 컴포넌트는 `PascalCase`, 함수·변수는 `camelCase`로 짓습니다.
- 함수 이름은 하는 일을 동사로 씁니다 (`getDistance`, `uploadPhoto`).
- 파일이 200줄을 넘거나 컴포넌트가 여러 일을 하면 나눕니다.
- 주석은 한국어로, "무엇을"보다 "왜 이렇게 했는지"를 씁니다.

**라이브러리 추가**
- `npx expo install 패키지이름`으로 설치합니다 (Expo 버전에 맞는 버전을 골라 줍니다).
- Expo 공식 모듈을 먼저 찾고, 없으면 Expo Go를 지원하는 것만 씁니다.
- 라이선스는 MIT, Apache-2.0, BSD, ISC만 쓰고, 설치하면 기술 스택 표에 적습니다.
