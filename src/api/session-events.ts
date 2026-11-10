/**
 * 로그인이 풀렸다(출입증 재발급까지 실패했다)는 신호. 서버 요청 쪽(client.ts)이 보내고, 화면 쪽(루트 레이아웃)이 받아서 로그인 화면으로 보낸다.
 * 요청 코드가 화면 이동(router)을 직접 알지 않게 하려고 신호로 나눴다.
 */
const listeners = new Set<() => void>();

/** 로그인이 풀리면 부를 함수를 등록한다. 돌려받은 함수를 부르면 등록을 푼다 */
export function onSessionExpired(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifySessionExpired() {
  listeners.forEach((listener) => listener());
}
