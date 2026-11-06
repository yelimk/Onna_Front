import { ApiError } from '@/api/api-error';
import { apiBaseUrl } from '@/api/config';
import { notifySessionExpired } from '@/api/session-events';
import { clearTokens, getTokens, saveTokens, type Tokens } from '@/api/token-storage';

/** 배열은 같은 이름으로 여러 번 붙인다 (tagIds=1&tagIds=2). 서버(Spring)가 그렇게 받는다. */
type QueryValue = string | number | boolean | undefined | (string | number)[];

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  query?: Record<string, QueryValue>;
  /** JSON으로 보낼 값 */
  body?: unknown;
  /** 사진처럼 파일을 보낼 때 (multipart). body와 같이 쓰지 않는다. */
  formData?: FormData;
  /** /auth/** 는 로그인 전에 부르므로 출입증을 붙이지 않는다 */
  auth?: boolean;
};

function buildUrl(path: string, query?: Record<string, QueryValue>) {
  const params = Object.entries(query ?? {}).flatMap(([key, value]) =>
    (value === undefined ? [] : Array.isArray(value) ? value : [value]).map(
      (item) => `${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`,
    ),
  );
  return `${apiBaseUrl}${path}${params.length > 0 ? `?${params.join('&')}` : ''}`;
}

async function send(path: string, options: RequestOptions, accessToken?: string) {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  // multipart는 경계(boundary)값을 fetch가 직접 붙여야 해서 Content-Type을 비워 둔다
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';

  try {
    return await fetch(buildUrl(path, options.query), {
      method: options.method ?? 'GET',
      headers,
      body: options.formData ?? (options.body !== undefined ? JSON.stringify(options.body) : undefined),
    });
  } catch (error) {
    // 서버까지 못 간 진짜 이유(예: Network request failed)를 개발 서버 터미널에 남긴다. 백엔드와 원인을 찾을 때 쓴다.
    if (__DEV__) console.warn(`[api] ${options.method ?? 'GET'} ${path} 요청이 서버에 닿지 못했어요`, error);
    throw new ApiError(0, 'NETWORK_ERROR', '서버에 연결하지 못했어요. 인터넷 연결을 확인해 주세요.');
  }
}

async function toApiError(response: Response) {
  const data = await response.json().catch(() => null);
  return new ApiError(response.status, data?.code ?? 'UNKNOWN', data?.message ?? '잠시 후 다시 시도해 주세요.');
}

// 출입증이 만료된 요청이 동시에 여러 개 오면 재발급은 한 번만 하고 나머지는 그 결과를 기다리게 한다
let refreshing: Promise<Tokens | null> | null = null;

async function refreshTokens(refreshToken: string) {
  const response = await send('/auth/refresh', { method: 'POST', body: { refreshToken } });
  if (!response.ok) {
    // 재발급도 실패하면 다시 로그인해야 하므로 저장된 출입증을 지우고, 화면에 로그인이 풀렸다고 알린다.
    // 동시에 여러 요청이 실패해도 재발급은 한 번만 하므로(refreshing) 신호도 한 번만 간다
    await clearTokens();
    notifySessionExpired();
    return null;
  }
  const tokens = (await response.json()) as Tokens;
  await saveTokens(tokens);
  return tokens;
}

/**
 * 우리 서버에 요청을 보내는 단 하나의 입구. 출입증 붙이기, 만료 시 재발급 후 한 번 다시 보내기,
 * 에러를 ApiError로 바꾸기를 여기서만 한다. 화면은 src/api의 함수만 부르고 fetch를 직접 쓰지 않는다.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const useAuth = options.auth ?? true;
  const tokens = useAuth ? await getTokens() : null;
  let response = await send(path, options, tokens?.accessToken);

  if (useAuth && tokens && response.status === 401) {
    refreshing ??= refreshTokens(tokens.refreshToken).finally(() => {
      refreshing = null;
    });
    const renewed = await refreshing;
    if (renewed) response = await send(path, options, renewed.accessToken);
  }

  if (!response.ok) throw await toApiError(response);
  // 204(응답 내용 없음)는 그대로 끝낸다
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
