# 온나 (Onna) 프론트엔드

<!-- 프로젝트 소개, 팀원, 역할은 팀에서 함께 작성 예정 -->

대구·경북의 **속정**(겉은 무뚝뚝해도 속으로 챙겨 주는 마음)을 사진과 한 줄로 남기고, 다른 사람이 남긴 자리에 걸어가서 열어 보는 앱 **온나**의 프론트엔드 레포지토리예요. Expo(React Native) + TypeScript로 만들었고, iOS·Android 모두 **Expo Go**로 바로 열 수 있어요.

- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [실행 방법](#실행-방법)
- [아키텍처](#아키텍처)
- [폴더 구조](#폴더-구조)
- [화면 구성](#화면-구성)
- [기능별 설명](#기능별-설명)
- [서버 연결](#서버-연결)
- [디자인 시스템](#디자인-시스템)
- [팀원 폰에 배포하기](#팀원-폰에-배포하기)
- [협업 방식과 코드 규칙](#협업-방식과-코드-규칙)

## 주요 기능

| 기능 | 내용 |
|---|---|
| 남기기 | 앱 카메라로 찍은 사진에 제목과 한 줄을 붙여 그 자리에 남겨요. AI가 한 줄을 읽고 해시태그를 추천해요. 이름 없이 남고, 다른 사람 지도에는 24시간 뒤에 보여요 |
| 지도와 열기 | 남의 사진은 처음에 흐리게 보이고, 그 자리에 가까이(25m) 가야 선명하게 열려요 |
| 검색과 산책 경로 | 장소·해시태그로 찾고, 고른 해시태그가 붙은 자리를 들르는 산책 경로를 추천받아 길안내를 받아요 |
| 내 기록 | 내가 남긴 기록, 좋아요한 자리, 연 자리를 모아 보고, 알림으로 누가 내 기록을 열었는지 확인해요 |
| 온보딩 | 소개, 이메일 로그인·회원가입, 권한 안내, 취향 설문(해시태그·걷는 유형) |

## 기술 스택

| 구분 | 사용 기술 |
|---|---|
| 프레임워크 | React Native 0.88 + Expo SDK 58 |
| 언어 | TypeScript |
| 화면 이동 | Expo Router (파일 기반 라우팅, 타입이 있는 주소) |
| 애니메이션 | react-native-reanimated (Figma 프로토타입의 시간·곡선을 그대로 옮김) |
| 이미지 | expo-image (SVG 아이콘 포함) |
| 지도 | 카카오맵 JavaScript SDK (react-native-webview 안에 띄움) |
| 위치 | expo-location |
| 로그인 토큰 저장 | expo-secure-store |
| 카메라 | expo-camera (카메라 권한만, 갤러리 권한 없음) |
| 사진 파일 업로드 | expo-file-system (찍은 사진을 `File`로 담아 multipart로 보냄) |
| 사진 자르기·줄이기 | expo-image-manipulator (모든 사진을 세로 3:4, 1080×1440으로) |
| 알림 권한 | expo-notifications (권한 요청만. 알림은 앱 안 알림 목록으로 보여 줌) |
| 장소 검색 | 카카오 로컬 API (키워드 검색, 좌표→주소) |
| 걷는 길 | TMAP 보행자 경로 API (키가 없으면 직선 경로로 대신) |
| 기기 저장 | @react-native-async-storage/async-storage (최근 검색기록, 소개를 본 적 있는지, 알림을 마지막으로 본 시각) |
| 글꼴 | Pretendard (SIL Open Font License 1.1) |
| 배포 | EAS Update (팀원 폰에 새 버전 보내기) |
| 코드 검사 | ESLint (eslint-config-expo), TypeScript 타입 검사 |

지금 쓰는 라이브러리는 모두 Expo·React Native 공식 패키지(MIT)이고, 글꼴 Pretendard는 SIL OFL 1.1이에요.

## 실행 방법

### 준비물

- Node.js 22.13 이상 (React Native 0.88이 요구해요)
- 폰에 **Expo Go** 앱 설치 (App Store / Play 스토어)

### 실행

```bash
npm install
npx expo start
```

> Windows PowerShell에서 `npx`가 보안 오류로 막히면 `npx.cmd expo start`로 실행해요.

터미널에 뜬 QR 코드를 폰으로 찍으면 Expo Go에서 앱이 열려요.

- **아이폰**: 기본 카메라 앱으로 QR을 찍어요.
- **안드로이드**: Expo Go 앱의 "Scan QR code"로 찍어요.
- PC와 폰은 **같은 와이파이**에 있어야 해요. 다른 네트워크라면 `npx expo start --tunnel`로 실행해요.

코드를 저장하면 폰 화면에 바로 반영돼요.

### 환경 변수 (카카오·TMAP 키, 서버 주소)

키가 없어도 앱은 열려요. 지도 자리에는 회색 지도가, 장소 검색 자리에는 안내 문구가, 산책 경로에는 직선이 대신 나와요. 진짜 지도와 검색을 쓰려면:

1. [카카오 개발자 콘솔](https://developers.kakao.com)에서 앱을 만들고 **앱 설정 > 앱 > 플랫폼 키**에서 **JavaScript 키**(지도)와 **REST API 키**(장소 검색)를 복사해요.
2. 같은 곳의 JavaScript 키 설정 **JavaScript SDK 도메인**에 `http://localhost`를 등록해요. 앱 안의 지도 페이지가 이 주소로 열려서, 등록하지 않으면 지도가 뜨지 않아요.
3. 프로젝트 맨 위 폴더에 `.env.example`을 복사해 `.env`를 만들고 키를 넣어요. `.env`는 GitHub에 올라가지 않아요.

```bash
EXPO_PUBLIC_KAKAO_MAP_JS_KEY=복사한_JavaScript_키
EXPO_PUBLIC_KAKAO_REST_API_KEY=복사한_REST_API_키
# (선택) SK open API의 TMAP 앱 키. 넣으면 산책 경로가 실제 걷는 길을 따라가요.
EXPO_PUBLIC_TMAP_APP_KEY=복사한_TMAP_앱_키
# (선택) 서버 주소. 비우면 src/api/config.ts의 기본 서버 주소를 써요.
EXPO_PUBLIC_API_URL=http://서버주소/api/v1
```

4. `.env`를 바꾼 뒤에는 `npx expo start`를 껐다가 다시 켜요.

> `EXPO_PUBLIC_`로 시작하는 값은 앱 안에 들어가서 누구나 꺼내 볼 수 있어요. 해커톤 시연용으로는 괜찮지만, 실제로 출시할 때는 장소 검색처럼 키가 필요한 요청을 우리 서버를 거치게 바꿔요. 비밀 키는 앱에 넣지 말고 백엔드에 둬요.

### 검사

작업을 마치면 아래 두 가지를 통과하는지 확인해요.

```bash
npx expo lint      # 코드 스타일 검사
npx tsc --noEmit   # 타입 검사
```

## 아키텍처

화면 하나가 그려지기까지 코드는 아래 순서로 이어져요. 위쪽은 아래쪽을 가져다 쓰고, 아래쪽은 위쪽을 모르게 만들었어요.

```
src/app/            주소(라우트)만. 파일마다 한 줄로 기능 폴더의 화면을 꺼내 보여 줌
   ↓
src/features/<기능>/screens/     화면. 부품을 조립하고 훅을 부름
   ↓
src/features/<기능>/components, hooks, utils, constants     그 기능에서만 쓰는 부품·상태·계산
   ↓
src/components, hooks, utils, constants, types     두 기능 이상이 같이 쓰는 것 (디자인 시스템 포함)
   ↓
src/api/            서버 요청 함수. 모든 요청은 client.ts 한 곳을 거침
```

이렇게 나눈 이유:

- **라우트와 화면을 떼어 놓았어요.** `src/app/`의 파일은 `export { MapScreen as default } from '@/features/map/screens/map-screen';` 한 줄뿐이에요. 주소를 바꾸거나 화면을 옮겨도 서로 영향을 주지 않아요.
- **기능 폴더별로 담당을 나눴어요.** 지도 담당은 `features/map`, 화면 담당은 나머지 기능 폴더에서 작업해서 Git 충돌을 줄였어요. 한 기능에서만 쓰는 것은 그 폴더 안에, 두 기능 이상이 쓰게 되면 `src/`의 공통 폴더로 올려요.
- **화면은 그리기만, 데이터는 훅이 맡아요.** 서버에서 받아 오고, 다시 받고, 실패를 처리하는 일은 `use-*.ts` 훅에 두고 화면은 그 결과만 그려요. 예: `features/my/hooks/use-my-summary.ts`, `features/map/hooks/use-map-zones.ts`.
- **서버 요청은 한 곳으로 모았어요.** `api/client.ts`가 로그인 토큰을 붙이고, 토큰이 만료되면 한 번 새로 받아 다시 보내고, 서버 오류를 `ApiError`로 바꿔요. 다시 받기도 실패하면 `api/session-events.ts`로 알리고, 루트 레이아웃의 `hooks/use-session-expired-redirect.ts`가 어느 화면에서든 로그인 화면으로 보내요.
- **화면 사이에 넘기는 값은 Context 하나로.** 남기기는 촬영 → 한 줄 → 위치 확인 세 화면을 거쳐서, 그동안 쓰는 값(사진, 위치, 제목, 한 줄, 해시태그)을 `features/upload/upload-draft.tsx`의 Context에 모아 둬요.
- **디자인 값은 이름으로만.** 색·글씨·간격·모서리·애니메이션 시간을 `src/constants/`에 이름을 붙여 두고 화면에서는 이름만 써요. Figma가 바뀌면 이 파일만 고치면 앱 전체가 바뀌어요.
- **Expo Go에서 열리는 것만 썼어요.** 팀 모두가 QR 하나로 바로 테스트할 수 있게, Expo Go에 들어 있는 모듈만 써요. 그래서 지도도 앱용 카카오맵 SDK 대신 WebView 안에 카카오맵 JavaScript SDK를 띄웠어요.

## 폴더 구조

```
src/
  app/            화면 주소와 화면 이동 구조 (Expo Router). 화면 파일은 한 줄씩
  features/       기능별 코드
    auth/           시작 화면, 소개, 로그인, 회원가입, 권한, 취향 설문
    map/            지도, 검색, 검색결과·경로 추천, 묶음 목록, 길안내, 사진 카드(신고 창), 카카오맵(kakao-map/)
    record/         내 기록 목록, 기록 상세
    upload/         남기기 (촬영, 한 줄, 위치 확인)와 남기는 동안의 값(upload-draft.tsx)
    my/             마이, 좋아요 내역, 연 자리 기록, 두 목록의 상세, 사용자 기호 설정, 설정, 약관
    notification/   알림 목록, 새 알림 빨간 점
  components/     두 개 이상의 기능이 같이 쓰는 부품 (아래 '공통 부품')
  constants/      디자인 시스템(색, 글씨, 간격, 애니메이션)과 앱 전체가 쓰는 값(약관 문장, 걷는 유형 보기, 선호 태그 최소 개수)
  hooks/          같이 쓰는 훅 (누름·전환 애니메이션, 내 기록, 태그 사전, 로그인 풀림 처리 등)
  api/            서버 요청 함수 (아래 '서버 연결')
  mock/           서버 목록이 비어 있을 때 대신 보여 주는 예시 데이터
  utils/          날짜 쓰기, 서버 날짜 읽기, 해시태그 모양, 오류 토스트 같은 작은 함수
  types/          서버 데이터 타입(api.ts)과 같이 쓰는 타입
assets/
  fonts/          Pretendard 글꼴 파일
  icons/          Figma에서 받은 아이콘 SVG
  images/         앱 아이콘, 온보딩 일러스트(onboarding/), 남기기 화면 그림(upload/), 목록 예시 사진(sample/)
```

각 기능 폴더 안은 같은 모양이에요: `screens/`(화면), `components/`(그 기능의 부품), `hooks/`(상태와 서버 요청), `utils/`(계산), `constants/`(문구·보기·예시 값).

## 화면 구성

```
앱 시작 → (저장된 로그인이 있으면 바로 지도) 소개 → 로그인 → (회원가입) → 권한 요청 → 취향 설문 → 지도
                                                                              └─ 건너뛰기 → 지도

아래 탭
├─ 지도  /map            → 검색 → 검색결과 → 경로 추천 카드 → 길안내 → 도착하면 '열렸어요'
│                         → 묶음 목록 → 사진 카드 /photo/[id] (좋아요, 신고 창)
├─ 기록  /record         → 기록 상세 /record/[id]
└─ 마이  /my             → 알림(오른쪽 위 종) → 기록 상세(/my/record/[id])
                         → 좋아요 내역·연 자리 기록 → 상세(/my/spot/[id])
                         → 사용자 기호 설정, 설정 → 약관

남기기 (탭 바 없는 전체 화면)  /upload/camera → write → confirm → 내 기록
  지도의 카메라 버튼, 사진 카드의 '나도 이 자리에 남기기'에서 들어와요.
```

| 주소 | 화면 파일 |
|---|---|
| `/` (시작), `/intro`, `/login`, `/signup`, `/permission`, `/survey` | `features/auth/screens/` |
| `/map`, `/map/search`, `/map/results`, `/map/navigation`, `/map/cluster/[id]` | `features/map/screens/` |
| `/photo/[id]` (사진 카드, 신고 창) | `features/map/screens/photo-detail-screen.tsx` |
| `/record`, `/record/[id]` | `features/record/screens/` |
| `/upload/camera`, `/upload/write`, `/upload/confirm` | `features/upload/screens/` |
| `/my`, `/my/likes`, `/my/opened-history`, `/my/spot/[id]`, `/my/preferences`, `/my/settings` | `features/my/screens/` |
| `/my/notifications` | `features/notification/screens/` |
| `/terms` (회원가입 약관 화살표, 설정에서 들어옴) | `features/my/screens/terms-screen.tsx` |

`/map/walk`(옛 산책 경로 화면)는 코드만 남아 있고, 앱에서 들어가는 버튼은 없어요. 산책 경로는 검색결과의 경로 추천 카드와 길안내가 맡아요.

## 기능별 설명

### 시작과 온보딩 (`features/auth`)

- **시작 화면**: 저장된 로그인 토큰이 있으면 로그인을 건너뛰고 바로 들어가요. 처음 설치한 사람에게만 소개 3장을 보여 주고, 본 적 있으면 로그인으로 보내요 (`start-screen.tsx`, `utils/intro-seen.ts`).
- **로그인·회원가입**: 회원가입은 이메일 → 비밀번호 → 닉네임 → 약관 4단계예요. 입력 규칙은 `utils/signup-rules.ts`에 모았어요. 오류는 칸을 떠날 때 보여 주고, 고치면 바로 지워요 (`hooks/use-field-error-timing.ts`). 닉네임 '사용할 수 있어요'는 입력을 멈추고 0.5초 뒤에 보여 줘요 (`hooks/use-settled-value.ts`).
- **약관**: 회원가입 약관 줄의 화살표를 누르면 그 문서를, 설정에서는 이용약관·위치기반 서비스 이용약관·개인정보 처리방침을 보여 줘요. 문장은 `constants/terms.ts`에 있어요.
- **권한 안내**: 위치·카메라·알림 권한을 실제로 요청해요 (`utils/request-app-permissions.ts`). 알림 권한은 나중에 푸시를 붙일 수 있게 미리 받아 둬요.
- **취향 설문**: 나와의 관계(1/3) → 끌리는 자리 해시태그(2/3, 3개 이상) → 걷는 방식·한 번에 걷는 시간(3/3) → 완료 요약이에요. 해시태그 목록은 서버 태그 사전에서 받고, 고른 해시태그를 서버에 저장해요. 해시태그 최소 개수는 마이 탭 사용자 기호 설정과 같은 값을 써요 (`constants/preferred-tags.ts`).

### 지도 (`features/map`)

지도 API는 **카카오맵**이에요. Expo Go에서도 열리도록 네이티브 SDK 대신 WebView 안에 카카오맵 JavaScript SDK를 띄워요. 지도 홈(`/map`), 검색결과(`/map/results`), 묶음 목록(`/map/cluster/[id]`), 길안내(`/map/navigation`), 남기기 위치 확인(`/upload/confirm`의 작은 지도, `features/map/components/place-preview-map.tsx`)이 카카오맵이에요. 카카오맵 코드는 `features/map/kakao-map/`에 모여 있어요.

| 파일 | 하는 일 |
|---|---|
| `kakao-map-view.tsx` | WebView에 지도를 띄우고 마커·내 위치를 보내요. 키가 없거나 지도를 못 불러오면 회색 지도를 보여줘요. |
| `build-kakao-map-html.ts` | WebView에 넣을 지도 페이지 (카카오 SDK 불러오기, 마커 그리기) |
| `kakao-map-styles.ts` | 마커 CSS. 마커는 HTML이라 `AppText`를 못 써서, `colors`·`typography` 값을 CSS로 바꿔 넣어요. |
| `kakao-map-bridge.ts` | 앱과 지도 페이지가 주고받는 메시지 모양 |

**지도 홈**은 서버의 **지도 구역**(`GET /map/zones`)으로 마커를 그려요 (`hooks/use-map-zones.ts`, `utils/zones-to-markers.ts`).
- 사진이 한 장인 구역은 사진 마커, 여러 장이면 묶음 마커('#첫태그 · 둘째태그 +N개 더')예요. 사진이 없는 구역은 그리지 않아요.
- 사진이 열렸는지와 얼마나 흐린지는 서버가 내 위치로 정한 흐림 단계(`S0`→`OPEN`)를 따르고, 사진도 서버가 흐리게 만든 것을 그대로 보여줘요.
- 구역은 앱 전체가 한 번 받아 같이 써요. 30m 걸으면 다시 받고(흐림 단계가 바뀌므로), 가만히 있어도 사진 주소가 30분 뒤 만료되기 전에 25분마다 다시 받아요 (`constants/map-config.ts`).
- 사진 마커는 사진마다 오는 좌표(일부러 흐린 좌표)에 놓고, 묶음 마커는 구역 자리에 놓아요.
- 지도 구역은 남의 사진만 주고(남의 지도에는 올린 지 24시간 뒤부터), 내 사진은 빼고 줘요. 그래서 내가 남긴 기록은 `GET /users/me/posts`로 따로 받아 열린 사진 마커로 바로 올려요 (`hooks/use-my-map-posts.ts`).
- 위치 권한 없이 둘러보면 위치를 빼고 캠퍼스 가운데를 지도 중심으로 보내요. 서버가 맛보기·내가 연 사진만 열어 줘요.
- 로그인하지 않았거나 인터넷이 끊기면 지도 위에 안내 한 줄이 떠요.
- 오른쪽 위 **탐색 모드** 스위치를 켜면 내 위치 둘레에 열림 반경 원(25m, 서버가 사진을 열어 주는 거리)이 그려지고, 아래 패널에 **가장 가까운 기록**이 떠요 (`components/explore-sheet.tsx`).
- 위치는 앱 전체가 GPS 하나를 같이 써요 (`hooks/use-my-location.ts`).

**검색**(`/map/search`)은 지도 홈 위에 투명하게 덮이는 창이에요. 검색창을 누르면 지도 위 버튼·마커 이름표·탭 바가 먼저 흐리게 사라지고, 이어서 검색 창이 위에서 내려와요. 글자를 치는 동안 결과가 바로 나오고, 키보드의 검색을 누르면 **검색결과 화면**(`/map/results`)으로 가요. 검색결과 화면에는 장소 / 해시태그 탭, 결과 위치를 보여주는 지도, 가까운순·정확도순 목록이 있어요. 아래 패널(목록 → 장소 카드 → 경로 카드)이 바뀔 때마다 이전 패널이 내려가고 새 패널이 아래에서 올라와요 (`components/sliding-panel.tsx`).

- **장소**: 카카오 로컬 API로 찾아요 (`api/search-places.ts`). 동네 이름은 카카오 좌표→주소 API로 붙여요 (`api/get-region-name.ts`).
- **해시태그**: `#`으로 시작하면 해시태그 검색이에요. 서버(`GET /search/hashtags`)가 해시태그마다 가장 가까운 기록 자리·거리·기록 수·기록 핀을 줘요. 정확도순은 검색어와 똑같은 것 → 검색어로 시작하는 것 → 들어간 것 순으로 앱이 다시 놓아요 (`hooks/use-hashtag-search.ts`, `utils/search-hashtags.ts`). 해시태그 결과를 고르면 기록 핀 자리마다 핀이 찍히고, 핀을 누르면 장소 카드가 떠요. 그 카드를 누르면 지도 홈에서 그 장소 카드를 띄워요 (`hooks/use-home-place.ts`).
- **최근 검색기록**은 폰에 저장돼서 앱을 꺼도 남아요. 검색 화면과 검색결과 화면이 같은 기록을 써요.

**경로 추천과 길안내**
- 결과 하나를 누르면 **경로 추천 카드**가 떠요. 내 위치에서의 거리, 이 근처(300m) 남겨진 기록 수, 그 기록들의 해시태그가 나와요. 해시태그를 골라 '경로 추천'을 누르면 **AI 추천 경로**가 그려져요.
- 들를 자리: 서버 AI 추천(`GET /recommendations/route`)에 목적지, 고른 해시태그, 목적지까지 걷는 대략의 시간(`minutes`)을 보내고, 받은 자리를 걸어가며 만나는 순서대로 최대 3곳 써요. 추천을 받지 못하면 지도 기록 중 고른 해시태그가 붙은, 내 위치→목적지 직선에서 250m 안쪽 자리로 대신 골라요 (`hooks/use-walk-route.ts`, `utils/pick-route-stops.ts`).
- 경로 선: TMAP 보행자 경로 API로 실제 걷는 길을 받아요. 키가 없거나 실패하면 직선으로 이어요 (`api/get-walk-route.ts`).
- **길안내**(`/map/navigation`)는 걸으면서 내 위치를 경로 위에 놓아 걸어온 길(회색)과 남은 길(주황)을 나눠 그리고, '다음 자리까지 N분'을 보여줘요. 아래 '범위 내 기록들'은 내 열림 반경 안의 기록이에요 (`hooks/use-walk-navigation.ts`). 목적지(25m 안)에 닿으면 목적지 50m 안의 기록을 서버에 열어 달라고 하고, 열리면 **'열렸어요'(사진 해금)** 화면을 띄워요 (`components/photo-unlock-overlay.tsx`).

**묶음 목록**(`/map/cluster/[id]`)은 위쪽 지도에 고른 묶음을 주황 원으로 표시하고, 아래 패널에 묶음 안의 기록을 서버가 준 순서(AI 추천순)로 보여줘요. 기록은 `GET /zones/{id}/posts`로 받고, 지도 구역과 같은 기준(30m 걷기, 25분)으로 다시 받아요 (`hooks/use-zone-posts.ts`). 검색결과와 묶음 목록의 아래 패널은 같은 부품(`components/map-bottom-sheet.tsx`)이에요.

**사진 카드**(`/photo/[id]`, 탭 바까지 덮는 투명 모달)는 지도 위 사진, 묶음 기록, 범위 내 기록, '사진과 한 줄 보기'에서 열려요.
- 처음에는 받아 둔 흐린 사진과 해시태그를 보여주고, 가까이 있으면 서버에 열어 달라고 해요(`POST /posts/{id}/open`). 열리면 선명한 사진, 한 줄, 좋아요, 신고, '나도 이 자리에 남기기'가 보여요.
- 멀면(TOO_FAR) '한줄 코멘트는 가까이 가면 열려요', 위치가 부정확하면(RETRY_LOCATION) 위치를 잡는 중이라고 보여주고 다음 위치 때 다시 열어 봐요.
- 좋아요는 누르자마자 바뀌고, 서버(`POST·DELETE /posts/{id}/likes`)가 거절하면 되돌린 뒤 토스트로 알려요. 연 기록은 앱이 켜져 있는 동안 기억해요 (`hooks/use-opened-posts.ts`).
- 신고 창(`components/report-sheet.tsx`)은 아래에서 올라와요. 지금은 신고 사유를 고르면 접수 안내만 보여줘요.

### 남기기 (`features/upload`)

1. **촬영**(`/upload/camera`): `expo-camera`로 앱 안에서 찍어요. **카메라 권한만** 받고, 갤러리 권한은 받지 않아요. 찍은 사진은 갤러리에 저장하지 않고, 가운데를 세로 3:4로 잘라 1080×1440으로 줄여요 (`utils/normalize-photo.ts`). 위치는 사진 EXIF가 아니라 **셔터를 누른 순간**의 위치를 써요.
2. **한 줄**(`/upload/write`): 서버가 준 질문 아래에 제목(10자)과 한 줄(40자)을 써요. 한 줄을 쓰면 AI가 해시태그를 추천하고, 그중 1~3개를 골라요. 추천을 기다리는 동안은 반짝이는 로딩 상자가 떠요 (`components/ai-hashtag-loading.tsx`). 한 줄을 고치면 고른 해시태그는 지워져요.
3. **위치 확인**(`/upload/confirm`): 작은 카카오맵에 남길 자리를 보여 주고, 위치를 다시 찾을 수 있어요. '기록 완료'를 누르면 사진을 올리는 동안 버튼에 도는 동그라미가 떠요. 얼굴이 보이면(FACE_DETECTED) 다시 찍으라고 알려 주고, 위치 오차가 크면(RETRY_LOCATION) 위치를 다시 찾으라고 알려 줘요 (`hooks/use-submit-post.ts`).

세 화면이 쓰는 값은 `upload-draft.tsx`의 Context에 모아 두고, 끝나면 내 기록으로 가요.

### 기록 탭 (`features/record`)

- **내 기록 목록**: 남긴 기록을 최신순으로 사진, 제목, 한 줄, 해시태그, 날짜, 받은 좋아요 수와 함께 보여 줘요. 날짜는 짧게 써요(올해는 `08.28`, 그 전은 '작년', '재작년', 연도, `utils/format-date.ts`). 제목이 길면 날짜를 먼저 지키고 제목을 줄여요. 오른쪽 위 토글로 리스트 / 지도 보기를 바꿔요.
- **기록 상세**: 사진, 한 줄, 해시태그를 보여 주고, 휴지통을 누르면 확인 창(`ConfirmDialog`)을 거쳐 지워요.

### 마이 탭 (`features/my`, `features/notification`)

- **마이**: 닉네임, 칭호, 남긴 자리·연 자리·좋아한 자리 수(`GET /users/me/achievements`)를 보여 줘요 (`hooks/use-my-summary.ts`). 칭호는 지금 앱에 고정한 값이에요 (`constants/profile-badges.ts`).
- **좋아요 내역·연 자리 기록**: 리스트 / 지도 보기를 바꿀 수 있고, 누르면 상세로 가요. 상세에서 좋아요를 취소하거나 신고할 수 있어요 (신고 창은 지도의 신고 창을 그대로 가져다 써요, `components/report-overlay.tsx`).
- **알림**: 누군가 내 기록을 열었을 때, 내 기록이 그 자리의 대표 사진이 됐을 때 오는 소식을 '5분 전', '3시간 전', '일주일 전', '작년'처럼 지금과의 차이로 묶어 보여 줘요 (`utils/format-relative-time.ts`). 누르면 그 기록의 상세로 가요. 서버가 '새 알림' 표시를 주지 않아서, 알림 화면을 마지막으로 나간 시각을 폰에 적어 두고 그 뒤에 온 알림에 빨간 점을 붙여요. 마이 탭 종 버튼의 빨간 점도 같은 기준이에요 (`features/notification/utils/notification-seen-at.ts`).
- **사용자 기호 설정**: 지금 고른 해시태그를 서버에서 불러와 고치고 저장해요 (3개 이상).
- **설정**: 위치·카메라·알림 권한 상태(누르면 폰 설정으로 가고, 돌아오면 다시 확인), 로그인 계정 이메일(길면 뒤를 '…'로), 약관, 로그아웃, 회원 탈퇴(확인 창 → `DELETE /users/me` → 로그인 화면)가 있어요.

### 예시 데이터

서버에 아직 기록이 없을 때도 화면을 확인할 수 있게, 서버 목록이 비어 있으면 `src/mock/`의 예시를 대신 보여 줘요. 내 기록, 좋아요 내역·연 자리 기록, 알림, 마이 숫자가 그래요. 서버에 데이터가 하나라도 있으면 서버 데이터만 보여 줘요. 내 기록·좋아요 내역·연 자리 기록의 '지도' 보기는 아직 예시 구역 데이터로 그려요.

## 서버 연결

서버 주소는 `src/api/config.ts`에 있어요 (`.env`의 `EXPO_PUBLIC_API_URL`이 있으면 그걸 써요). 서버 요청은 모두 `src/api/`에 함수로 만들어 두었어요.

| 파일 | 요청 |
| --- | --- |
| `client.ts` | 모든 요청이 거치는 곳. 로그인 토큰을 붙이고, 토큰이 만료되면 한 번 새로 받아 다시 보내요. 서버 에러는 `ApiError`(`api-error.ts`)로 바꿔요 |
| `token-storage.ts` | 로그인 토큰을 폰 안 보안 저장소(expo-secure-store)에 저장 |
| `session-events.ts` | 토큰을 다시 받지 못했을 때 앱 전체에 알리는 신호 |
| `auth.ts` | 회원가입, 로그인, 로그아웃 |
| `users.ts` | 내 정보, 회원 탈퇴, 선호 태그 불러오기·저장, 내 기록, 내 업적, 연 자리 기록, 좋아요 내역, 알림 |
| `tags.ts` | 해시태그 사전, 남기기 질문 |
| `posts.ts` | AI 해시태그 추천, 사진 남기기, 기록 삭제 |
| `map.ts` | 지도 구역, 구역 사진 목록, 사진 열기, 좋아요, 해시태그 검색, 산책 경로 추천 |

지켜야 할 것:

- **서버 날짜는 꼭 `utils/parse-server-date.ts`로 읽어요.** 서버 날짜(createdAt 등)는 시간대 없이 한국 시각으로 와서, `new Date()`로 바로 읽으면 폰 시간대에 따라 틀려요.
- **화면에서 따로 처리하지 않은 서버 오류는 `utils/show-api-error.ts`로 보여 줘요.** 서버가 준 문장을 위쪽 빨간 토스트로 띄우고, 인터넷이 끊기는 등 문장이 없으면 '잠시 후 다시 시도해 주세요'를 띄워요. 화면은 오류 문장 대신 오류 코드(`api-error.ts`)로 갈래를 나눠요.
- 지도 위치는 서버 모양(`lat`, `lng`, `accuracy`)으로 바꿔 보내요 (`features/map/utils/to-coordinate.ts`). 기록 id는 지도 안에서 문자열, 서버에 보낼 때 숫자로 바꿔요.
- 사진 주소는 30분 뒤 만료돼서, 지도 구역·묶음·연 사진은 받은 지 25분이 지나면(앱이 다시 앞으로 올 때도) 다시 받아요.

## 디자인 시스템

Figma `디자인 시스템` 페이지의 값을 코드로 옮겨 두었어요.

| 파일 | 내용 |
|---|---|
| `src/constants/colors.ts` | 색상 (Primary, Gray, Semantic, Text, Border, Background) |
| `src/constants/typography.ts` | 글씨 스타일 (Heading, Subtitle, Body, Caption, Button) |
| `src/components/app-text.tsx` | 글씨 부품 `AppText` (글자색을 서서히 바꿀 때는 `AnimatedAppText`) |
| `src/constants/layout.ts` | 간격(`spacing`), 모서리(`radius`), 화면 좌우 여백 |
| `src/constants/motion.ts` | 애니메이션 시간(`duration`)과 곡선(`easeOut`, `easeIn`, `easeInOut`). Figma 프로토타입 설정 값을 옮겼어요 |

### 사용법

```tsx
import { AppText } from '@/components/app-text';
import { colors } from '@/constants/colors';

<AppText variant="heading01">제목</AppText>
<AppText variant="body02" color="textSecondary">본문</AppText>

<View style={{ backgroundColor: colors.background02 }} />
```

### 지켜야 할 것

- 색은 `#FB8C00`처럼 직접 쓰지 말고 `colors`에서 이름으로 가져다 써요.
- 글씨는 React Native의 `Text` 대신 `AppText`를 써요.
- 위 두 가지를 어기면 VS Code에 **노란 줄(경고)**이 떠요. 앱 실행은 막지 않아요.
- 디자인 시스템에 없는 값이 필요하면 화면에 임시로 넣지 말고 `src/constants/`에 이름을 붙여 추가해요.
- Figma 값은 **글씨·여백·모서리·색은 그대로**, **화면 너비(390)·고정 위치는 폰 크기에 맞게** 바꿔서 옮겨요. 자세한 기준은 `AGENTS.md`의 "Figma 수치 옮기기"에 있어요.

### 공통 부품

화면을 만들 때 아래 부품을 먼저 가져다 써요. 지도 화면에서도 같이 써요.

| 부품 | 용도 |
|---|---|
| `ScreenContainer` | 모든 화면의 바깥 틀 (여백, 안전 영역, 위·아래 고정 영역) |
| `ScreenHeader` | 뒤로가기, 제목, 오른쪽 버튼 |
| `Button` | 큰 버튼 (`primary` 강조 / `dark` 기본 / `outline` 보조). 비활성이면 회색, `isLoading`이면 도는 동그라미 |
| `TextField` | 라벨이 있는 입력창 (오류·성공 안내 포함) |
| `Checkbox` | 체크박스 |
| `Icon` | Figma 아이콘 (`assets/icons`). Figma에 없는 몇 개만 기기 기본 아이콘 |
| `PhotoPlaceholder` | 사진이 없을 때의 회색 사진 자리 |
| `Chip` | 해시태그·필터·최근 검색어 같은 동그란 작은 버튼 |
| `Badge` | 맛보기, 곧 열려요, AI 추천 같은 작은 상태 표시 |
| `IconButton` | 동그란 아이콘 버튼 (지도 위 버튼, 마이 탭 종). 빨간 점 표시 가능 |
| `SegmentedToggle` | 리스트 / 지도처럼 보기 방식을 바꾸는 작은 토글 |
| `Radio` | 여럿 중 하나만 고르는 동그라미 (신고 사유 등) |
| `MapPlaceholder` | 지도를 띄울 수 없을 때의 회색 지도 |
| `Toggle` | 켜고 끄는 주황 스위치 |
| `AppTabBar` | 아래 탭 바 (지도·기록·마이, 고른 탭 위 주황 막대). 기록·마이 탭 안쪽 화면에서는 숨김, 지도 검색 화면에서는 흐리게 사라짐 |
| `Toast` | 화면 위에 잠깐 뜨는 알림. `showToast('삭제되었습니다', 'success')`로 부른다 (`error` / `success` / `plain`). 루트 레이아웃에 `ToastHost`가 있음 |
| `LikeButton` | 사진 상세 아래 '좋아요' 버튼 (누르면 빨간 하트·테두리) |
| `PressHighlight` | 누르고 있으면 뒤에 옅은 회색이 서서히 깔리는 누름 영역 |
| `ConfirmDialog` | 되돌릴 수 없는 일 전에 한 번 묻는 창 (기록 삭제, 회원 탈퇴) |
| `LoadingSpinner` | 기다리는 동안 도는 동그라미 |

### 애니메이션

누름·고름·화면 안 전환은 Figma 프로토타입의 시간과 곡선을 `constants/motion.ts`에 옮겨 그대로 써요. 새 부품에서 같은 움직임이 필요하면 아래 훅을 써요.

- `hooks/use-press-progress.ts`: 누르고 있는 동안 서서히 바뀌는 값
- `hooks/use-transition-progress.ts`: 켜짐·고름이 바뀔 때 서서히 바뀌는 값
- `hooks/use-fade-style.ts`: 흐려졌다 나타나는 모양

화면과 화면 사이의 이동(밀려 들어오기 등)은 폰 기본 움직임을 써요. 안드로이드는 화면 이동 시간을 정할 수 없어서, 두 OS에서 자연스러운 기본값을 그대로 두었어요.

## 팀원 폰에 배포하기

PC를 켜 두지 않아도 팀원이 새 버전을 볼 수 있게 **EAS Update**로 올려요. 앱 키는 Expo 서버의 환경 변수(development·preview·production)에 넣어 두었어요.

```bash
npx eas-cli@latest update --branch develop --environment development --message "바뀐 내용"
```

- 팀원은 **Expo Go**로 올린 업데이트의 QR을 찍어 열어요. 프로젝트가 비공개라서, Expo Go에 **onna-app 팀에 들어가 있는 Expo 계정으로 로그인**해야 열려요.
- 안드로이드 Expo Go는 버전 표시(runtimeVersion)가 `exposdk:58.0.0`인 업데이트만 열어요. Expo Go로 보여 줄 업데이트는 이 표시로 올려요.
- 서버만 바뀐 경우에는 다시 올릴 필요가 없어요. 앱 코드를 고쳤을 때만 올려요.

## 협업 방식과 코드 규칙

### 브랜치

| 브랜치 | 들어 있는 것 |
|---|---|
| `main` | 시연·제출용. 보여줘도 되는 것만 |
| `develop` | 팀 작업을 모으는 곳. 덜 완성됐어도 **앱이 안 깨지는** 것만 |
| `feature/이름-작업` | 각자 작업하는 곳. 예: `feature/yelim-design-3`, `feature/jonggyun-map-api-2` |

최신 `develop`에서 내 브랜치를 만들고, 작업이 끝나면 PR을 올려 **`develop`에 합쳐요.** `develop`을 `main`에 합치는 건 시연·제출 전에 둘이 확인하고 해요.

| 담당 | 주로 작업하는 폴더 |
|---|---|
| 지도 | `src/features/map` |
| 화면 | `src/features/auth`, `record`, `upload`, `my`, `notification` |

여러 기능이 같이 쓰는 파일(`components/`, `constants/`, 화면 이동 설정, `package.json`)을 고칠 때는 상대에게 먼저 한마디 해요.

PR을 올리기 전에 `npx expo lint`와 `npx tsc --noEmit`을 통과하고, 폰에서 한 번 열어 봐요.

### 코드 규칙

이름 짓는 법, 폴더 사용법, 주석 규칙은 [`AGENTS.md`](AGENTS.md)의 **우리 팀 규칙**에 있어요. AI 도구도 이 파일을 읽고 같은 규칙으로 코드를 써요. 요약하면:

- 파일 이름은 `kebab-case`, 컴포넌트는 `PascalCase`, 함수·변수는 `camelCase`
- 함수 이름은 하는 일을 동사로 (`getDistance`, `uploadPhoto`)
- 한 파일이 200줄을 넘거나 한 컴포넌트가 여러 일을 하면 나눠요
- 주석은 한국어로, "무엇을"보다 "왜 이렇게 했는지"를 써요

### 라이브러리 설치

`npm install` 대신 아래 명령어를 써요. 현재 Expo 버전에 맞는 버전을 골라줘요.

```bash
npx expo install 패키지이름
```

1. **Expo 공식 모듈을 먼저** 찾아요 ([Expo SDK 목록](https://docs.expo.dev/versions/latest/)). Expo Go에 들어 있어서 QR로 바로 테스트할 수 있어요.
2. 공식 모듈이 없으면 [React Native Directory](https://reactnative.directory/)에서 **"Expo Go" 표시가 있는 것**을 골라요. Expo Go에 없는 네이티브 라이브러리를 넣으면 Expo Go로는 앱이 열리지 않아요.
3. 라이선스는 **MIT, Apache-2.0, BSD, ISC**만 써요. GPL·AGPL이나 라이선스가 없는 것은 쓰지 않아요.
4. 설치한 라이브러리는 위 **기술 스택** 표에 적어요.
