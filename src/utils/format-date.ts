import { parseServerDate } from '@/utils/parse-server-date';

/** 서버 날짜(ISO 문자열, 시간대 없는 한국 시각)를 화면에 쓰는 '2026.08.28' 모양으로 바꾼다 */
export function formatDate(isoDate: string) {
  const date = parseServerDate(isoDate);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}.${month}.${day}`;
}

const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

/** 날짜별로 묶은 목록의 묶음 제목. 예: '10월 28일 (토)' */
export function formatDayLabel(isoDate: string) {
  const date = parseServerDate(isoDate);
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${weekdays[date.getDay()]})`;
}

/**
 * 내 기록 목록의 짧은 날짜 (디자이너 요청). 제목 옆 좁은 자리에 들어가서 길이를 줄였다.
 * - 올해 쓴 글: '08.28'
 * - 작년: '작년', 재작년: '재작년'
 * - 그보다 전: '2023'처럼 연도만
 */
export function formatShortDate(isoDate: string, now = new Date()) {
  const date = parseServerDate(isoDate);
  const yearsAgo = now.getFullYear() - date.getFullYear();
  if (yearsAgo <= 0) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}.${day}`;
  }
  if (yearsAgo === 1) return '작년';
  if (yearsAgo === 2) return '재작년';
  return String(date.getFullYear());
}
