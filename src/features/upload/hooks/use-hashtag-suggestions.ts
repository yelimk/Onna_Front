import { useRef, useState } from 'react';

import { getTagSuggestions } from '@/api/posts';
import type { Tag } from '@/types/api';

/**
 * 한 줄 코멘트를 다 쓰면 AI 해시태그 후보를 받아 온다.
 * 쓰는 도중에 매번 보내면 요청이 너무 많아서, 입력칸을 벗어날 때(키보드를 닫을 때) 한 번만 보낸다.
 */
export function useHashtagSuggestions() {
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  // 같은 한 줄로 다시 묻지 않으려고 마지막으로 보낸 내용을 기억한다
  const lastRequestedRef = useRef('');
  // 응답이 오기 전에 한 줄을 또 고치면, 늦게 온 옛날 응답은 버려야 해서 요청마다 번호를 붙인다
  const requestIdRef = useRef(0);

  const requestSuggestions = async (questionId: number | undefined, oneLine: string) => {
    const text = oneLine.trim();
    if (questionId === undefined || text.length === 0 || text === lastRequestedRef.current) return;

    lastRequestedRef.current = text;
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setHasFailed(false);
    try {
      const result = await getTagSuggestions(questionId, text);
      if (requestId === requestIdRef.current) setSuggestions(result);
    } catch {
      if (requestId !== requestIdRef.current) return;
      // 실패한 한 줄로 다시 누를 수 있게 기억을 지운다
      lastRequestedRef.current = '';
      setHasFailed(true);
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  };

  /** 한 줄을 고치기 시작하면 옛 후보는 맞지 않으니 지운다 */
  const clearSuggestions = () => {
    requestIdRef.current += 1;
    lastRequestedRef.current = '';
    setSuggestions([]);
    setIsLoading(false);
    setHasFailed(false);
  };

  return { suggestions, isLoading, hasFailed, requestSuggestions, clearSuggestions };
}
