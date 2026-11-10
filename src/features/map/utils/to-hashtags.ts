import { formatHashtag } from '@/utils/format-hashtag';

/**
 * 서버 태그 이름들 → 화면 해시태그 ('#' 붙이고 띄어쓰기 없앰).
 * 화면 모양으로 바꾸면 '말없이 챙겨준'(AI)과 '말없이챙겨준'(태그 사전)처럼 띄어쓰기만 다른 태그가 똑같아져서, 같은 것은 하나만 둔다.
 */
export function toHashtags(tagNames: string[]) {
  return [...new Set(tagNames.map(formatHashtag))];
}
