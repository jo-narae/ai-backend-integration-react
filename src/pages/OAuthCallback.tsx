import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

/**
 * 구글 OAuth2 로그인 콜백 수신 페이지.
 *
 * 백엔드(OAuth2LoginSuccessHandler)가 인증 성공 후
 * http://localhost:5173/oauth/callback?token=<JWT> 로 리다이렉트합니다.
 * 이 페이지는 쿼리스트링의 token을 꺼내 세션에 저장하고 /chat 으로 이동합니다.
 *
 * username은 별도로 전달되지 않으므로 JWT의 subject(sub) 클레임을 디코드해 사용합니다.
 * (서명 검증은 백엔드가 수행하며, 여기서는 화면 표시용으로만 payload를 읽습니다.)
 */
export default function OAuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [error, setError] = useState<string | null>(null);
  // React 18 StrictMode의 effect 2회 실행으로 중복 처리되는 것을 막습니다.
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const token = params.get('token');
    if (!token) {
      setError('토큰이 전달되지 않았습니다. 로그인을 다시 시도해 주세요.');
      return;
    }

    const username = usernameFromJwt(token) ?? 'unknown';
    setSession(token, username);
    navigate('/chat', { replace: true });
  }, [params, navigate, setSession]);

  if (error) {
    return (
      <div className="container">
        <h1>로그인 실패</h1>
        <div className="error">{error}</div>
        <p className="meta">
          <a href="/login">로그인 페이지로 돌아가기</a>
        </p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>로그인 처리 중...</h1>
    </div>
  );
}

/** JWT payload의 subject(sub)를 디코드합니다. 실패 시 null. */
function usernameFromJwt(token: string): string | null {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );
    return JSON.parse(json).sub ?? null;
  } catch {
    return null;
  }
}
