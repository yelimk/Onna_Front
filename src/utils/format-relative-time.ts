import { parseServerDate } from '@/utils/parse-server-date';

const minuteMs = 60_000;
const hourMs = 60 * minuteMs;
const dayMs = 24 * hourMs;

/**
 * 알림 시각을 지금과의 차이로 바꾼다 (디자이너 요청).
 * N분 전 → N시간 전 → N일 전 → 일주일 전 → N주 전 → N달 전 → 작년 → 재작년 → 그보다 전은 연도만
 * - 1분이 안 됐어도 '1분 전'으로 쓴다 (Figma 표현이 분부터 시작한다)
 * - 달은 30일로 센다. 12달이 넘으면 달력 연도로 작년·재작년·연도를 고른다 (내 기록 목록 날짜와 같은 기준)
 */
export function formatRelativeTime(isoDate: string, now = new Date()) {
  const date = parseServerDate(isoDate);
  const diff = Math.max(0, now.getTime() - date.getTime());

  if (diff < hourMs) return `${Math.max(1, Math.floor(diff / minuteMs))}분 전`;
  if (diff < dayMs) return `${Math.floor(diff / hourMs)}시간 전`;

  const days = Math.floor(diff / dayMs);
  if (days < 7) return `${days}일 전`;
  if (days < 14) return '일주일 전';
  if (days < 30) return `${Math.floor(days / 7)}주 전`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}달 전`;

  const yearsAgo = now.getFullYear() - date.getFullYear();
  if (yearsAgo <= 1) return '작년';
  if (yearsAgo === 2) return '재작년';
  return String(date.getFullYear());
}
