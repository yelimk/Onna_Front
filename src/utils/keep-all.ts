// 이 글자 앞뒤로는 줄을 바꾸지 말라는 보이지 않는 표시 (WORD JOINER)
const wordJoiner = '⁠';

/**
 * 웹의 word-break: keep-all처럼, 줄을 띄어쓰기 자리에서만 바꾸게 한다 (디자이너 요청).
 * 앱 글자는 줄 끝에 자리가 모자라면 한글 단어 중간('남/겨')에서도 꺾는다.
 * 단어 안 글자 사이마다 보이지 않는 표시를 넣어서, 단어를 통째로 다음 줄로 넘기게 한다. 화면에 보이는 글자는 그대로다.
 * 한 단어가 한 줄보다 길면 꺾을 곳이 없어 넘칠 수 있으니, 짧은 안내 문구처럼 띄어쓰기가 있는 문장에만 쓴다.
 */
export function keepAllWords(text: string) {
  return text
    .split(' ')
    .map((word) => Array.from(word).join(wordJoiner))
    .join(' ');
}
