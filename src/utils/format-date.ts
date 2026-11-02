/** 서버 날짜(ISO 문자열)를 화면에 쓰는 '2026.08.28' 모양으로 바꾼다 */
export function formatDate(isoDate: string) {
  const date = new Date(isoDate);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}.${month}.${day}`;
}
