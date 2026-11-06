// 끝에 시간대(Z, +09:00, -0500 등)가 붙어 있는지
const timeZonePattern = /([zZ]|[+-]\d{2}:?\d{2})$/;
// 날짜만 있는 값 (예: 2026-11-04)
const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

/** 우리 서버 시각의 시간대. 서버와 DB가 모두 Asia/Seoul이다 (백엔드 11월 답변) */
const serverTimeZoneOffset = '+09:00';

/**
 * 서버가 준 날짜 글자를 Date로 바꾼다. 서버 날짜(createdAt, openedAt, likedAt 등)는 이 함수로만 읽는다.
 * 서버는 '2026-11-04T18:00:00'처럼 시간대 없이 한국 시각을 준다.
 * 그대로 new Date()에 넣으면 휴대폰 시간대로 읽어서, 폰 시간대가 한국이 아니면 몇 시간씩 틀린다. 그래서 한국 시각(+09:00)을 붙여 읽는다.
 * 앱이 만든 값(예시 데이터의 toISOString)처럼 시간대가 이미 붙어 있으면 그대로 읽는다.
 */
export function parseServerDate(value: string) {
  if (timeZonePattern.test(value)) return new Date(value);
  if (dateOnlyPattern.test(value)) return new Date(`${value}T00:00:00${serverTimeZoneOffset}`);
  return new Date(`${value}${serverTimeZoneOffset}`);
}
