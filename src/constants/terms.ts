/**
 * 약관 문장. 팀 노션 '약관' 페이지의 '내용' 부분을 그대로 옮겼다 (근거는 노션에만 둔다).
 * 회원가입 약관 동의(features/auth)와 설정의 약관 화면(features/my)이 같이 써서 src/constants에 둔다.
 * 문장을 고칠 때는 노션과 이 파일을 같이 고친다.
 */

export type TermsDocumentId = 'service' | 'privacyConsent' | 'location' | 'age' | 'privacyPolicy';

export type TermsDocument = {
  title: string;
  items: string[];
};

export const termsDocuments: Record<TermsDocumentId, TermsDocument> = {
  service: {
    title: '이용약관',
    items: [
      '온나는 자리에 남겨진 사진을 걸어서 가까이 가면 열어 보고, 그 자리에 내 사진과 한 줄을 남기는 서비스예요.',
      '내 사진의 저작권은 나에게 있어요. 온나는 서비스 안에서 보여 주는 데 필요한 범위에서만 무료로 쓸 수 있게 허락받아요. 지우거나 탈퇴하면 더 이상 쓰지 않아요.',
      '얼굴이 보이는 사진은 올릴 수 없어요 (올릴 때 자동으로 막아요).',
      '남의 집·사적인 공간, 불쾌한 사진, 광고는 신고를 받아 정리할 수 있어요.',
      '약관이 바뀌면 바뀌기 전에 앱에서 알려요.',
    ],
  },
  privacyConsent: {
    title: '개인정보 수집·이용',
    items: [
      '목적: 가입·로그인, 취향에 맞는 자리 추천, 내 기록 보여 주기, 알림',
      '항목: 이메일, 비밀번호, 닉네임, 취향 설문 답, 남긴 사진·제목·한 줄·해시태그, 좋아요·연 자리 기록',
      '기간: 탈퇴할 때까지',
      '동의하지 않을 수 있지만, 그러면 가입할 수 없어요.',
    ],
  },
  location: {
    title: '위치기반 서비스 이용약관',
    items: [
      '운영자: 온나 팀',
      '서비스: 가까이 가면 사진 열기, 사진 남긴 자리 저장과 지도 표시, 가까운 자리·산책길 추천',
      '수집 방법: 앱을 쓰는 동안 휴대폰 위치(GPS)',
      '보유: 사진 남긴 자리는 사진을 지울 때까지, 사진을 열 때 쓴 위치는 거리 확인에만 사용, 수집사실 확인자료는 6개월',
      '권리: 동의는 언제든 전부 또는 일부 철회할 수 있어요 (휴대폰 설정에서 위치 끄기, 또는 탈퇴).',
    ],
  },
  age: {
    title: '만 14세 이상',
    items: ['만 14세 이상만 가입할 수 있어요.'],
  },
  privacyPolicy: {
    title: '개인정보 처리방침',
    items: [
      '처리하는 정보: 가입·로그인, 취향에 맞는 자리 추천, 내 기록 보여 주기, 알림을 위해 이메일, 비밀번호, 닉네임, 취향 설문 답, 남긴 사진·제목·한 줄·해시태그, 좋아요·연 자리 기록을 탈퇴할 때까지 보관해요.',
      '위치정보: 사진을 남긴 자리는 사진을 지울 때까지 보관하고, 사진을 열 때 쓴 위치는 거리를 확인하는 데만 써요. 자세한 내용은 위치기반 서비스 이용약관에 있어요.',
      '내 정보를 보거나 고치거나 지워 달라고 할 수 있어요 (탈퇴하면 지워져요).',
      '로그인 정보는 휴대폰 보안 저장소에 둬요.',
      '개인정보 보호책임자: 온나 팀',
      '바뀌면 바뀌기 전에 앱에서 알려요.',
    ],
  },
};

/** 설정 '이용약관 · 개인정보 처리방침'에서 차례로 보여주는 문서. 가입 때만 보는 동의(수집·이용, 나이)는 뺀다 */
export const settingsTermsDocumentIds: TermsDocumentId[] = ['service', 'location', 'privacyPolicy'];

export const isTermsDocumentId = (value: unknown): value is TermsDocumentId =>
  typeof value === 'string' && value in termsDocuments;
