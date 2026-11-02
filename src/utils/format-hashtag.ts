/**
 * 서버 태그 이름을 화면용 해시태그로 바꾼다. 예: '말없이 챙겨준 사람' → '#말없이챙겨준사람'
 * 해시태그는 띄어쓰기 없이 붙여 쓰는 게 자연스러워서 빈칸을 지운다.
 */
export function formatHashtag(tagName: string) {
  return `#${tagName.replace(/\s+/g, '')}`;
}
