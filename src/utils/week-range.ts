/** 오늘 0시 (밀리초). 알림 '오늘' 묶음과 예시 알림 시각이 같이 쓴다 */
export function getStartOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/** 이번 주 월요일 0시 (밀리초). 일요일이면 6일 전 월요일이다 */
export function getStartOfWeek() {
  const date = new Date(getStartOfToday());
  const daysSinceMonday = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - daysSinceMonday);
  return date.getTime();
}
