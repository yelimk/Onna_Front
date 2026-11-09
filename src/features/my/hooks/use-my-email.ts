import { useEffect, useState } from 'react';

import { getCached, setCached } from '@/api/response-cache';
import { getMe } from '@/api/users';

/**
 * 설정 '로그인 계정'에 보여줄 내 이메일. 받기 전이나 못 받으면 빈 글자라 줄 오른쪽이 비어 보인다.
 * 이메일은 바뀌지 않아서, 마이 탭에서 받아 둔 내 정보가 있으면 그것을 바로 쓰고 다시 묻지 않는다 (api/response-cache.ts).
 */
export function useMyEmail() {
  const [email, setEmail] = useState(() => getCached('me')?.email ?? '');

  useEffect(() => {
    if (getCached('me')) return;
    getMe()
      .then((me) => {
        setCached('me', me);
        setEmail(me.email);
      })
      .catch(() => setEmail(''));
  }, []);

  return email;
}
