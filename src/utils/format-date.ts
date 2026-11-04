/** 서버 날짜(ISO 문자열)를 화면에 쓰는 '2026.08.28' 모양으로 바꾼다 */
export function formatDate(isoDate: string) {
  const date = new Date(isoDate);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}.${month}.${day}`;
}

const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

/** 날짜별로 묶은 목록의 묶음 제목. 예: '10월 28일 (토)' */
export function formatDayLabel(isoDate: string) {
  const date = new Date(isoDate);
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${weekdays[date.getDay()]})`;
}
