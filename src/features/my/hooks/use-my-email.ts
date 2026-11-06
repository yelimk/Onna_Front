import { useEffect, useState } from 'react';

import { getMe } from '@/api/users';

/** 설정 '로그인 계정'에 보여줄 내 이메일. 받기 전이나 못 받으면 빈 글자라 줄 오른쪽이 비어 보인다 */
export function useMyEmail() {
  const [email, setEmail] = useState('');

  useEffect(() => {
    getMe()
      .then((me) => setEmail(me.email))
      .catch(() => setEmail(''));
  }, []);

  return email;
}
