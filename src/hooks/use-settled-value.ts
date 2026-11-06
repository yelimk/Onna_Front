import { useEffect, useState } from 'react';

/**
 * 값이 ms 동안 더 바뀌지 않으면 그 값을 돌려준다 (치는 걸 멈췄는지 알 때 쓴다).
 * 예: 닉네임을 다 친 뒤에만 '사용할 수 있어요'를 띄우려고, 친 값과 이 값이 같은지 본다.
 */
export function useSettledValue<T>(value: T, ms: number) {
  const [settled, setSettled] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), ms);
    return () => clearTimeout(timer);
  }, [value, ms]);

  return settled;
}
