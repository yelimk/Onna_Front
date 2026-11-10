import { useRef, useState } from 'react';

import { getTagSuggestions } from '@/api/posts';

/**
 * 한 줄 코멘트를 다 쓰면 AI 해시태그 후보를 받아 온다.
 * 쓰는 도중에 매번 보내면 요청이 너무 많아서, 입력칸을 벗어날 때(키보드를 닫을 때) 한 번만 보낸다.
 */
export function useHashtagSuggestions() {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [hasFailed, setHasFailed] = useState(false);
  // AI 응답을 기다리는 동안 '생성하고 있어요' 상자를 보여주려고 쓴다
  const [isLoading, setIsLoading] = useState(false);
  // 같은 한 줄로 다시 묻지 않으려고 마지막으로 보낸 내용을 기억한다
  const lastRequestedRef = useRef('');
  // 응답이 오기 전에 한 줄을 또 고치면, 늦게 온 옛날 응답은 버려야 해서 요청마다 번호를 붙인다
  const requestIdRef = useRef(0);

  const requestSuggestions = async (oneLine: string) => {
    const text = oneLine.trim();
    if (text.length === 0 || text === lastRequestedRef.current) return;

    lastRequestedRef.current = text;
    const requestId = ++requestIdRef.current;
    setHasFailed(false);
    setIsLoading(true);
    try {
      const result = await getTagSuggestions(text);
      if (requestId === requestIdRef.current) setSuggestions(result);
    } catch {
      if (requestId !== requestIdRef.current) return;
      // 실패한 한 줄로 다시 누를 수 있게 기억을 지운다
      lastRequestedRef.current = '';
      setHasFailed(true);
    } finally {
      // 옛 요청이 늦게 끝나도 새 요청의 기다림 표시를 끄지 않는다
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  };

  /** 한 줄을 고치기 시작하면 옛 후보는 맞지 않으니 지운다 */
  const clearSuggestions = () => {
    requestIdRef.current += 1;
    lastRequestedRef.current = '';
    setSuggestions([]);
    setHasFailed(false);
    setIsLoading(false);
  };

  return { suggestions, hasFailed, isLoading, requestSuggestions, clearSuggestions };
}
