import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { login, signup } from '../api/auth';
import { API_BASE_URL } from '../api/client';
import { useAuth } from '../auth/AuthContext';

export default function LoginPage() {
  const { setSession } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('alice');
  const [password, setPassword] = useState('password123');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === 'signup') {
        await signup(username, password);
      }
      const res = await login(username, password);
      setSession(res.token, res.username);
      navigate('/chat', { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container">
      <h1>{mode === 'login' ? '로그인' : '회원가입 후 로그인'}</h1>
      <form onSubmit={handleSubmit}>
        <label>
          사용자명
          <input value={username} onChange={(e) => setUsername(e.target.value)} required />
        </label>
        <label>
          비밀번호
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </label>
        <button type="submit" disabled={busy}>
          {busy ? '처리 중...' : mode === 'login' ? '로그인' : '가입 후 로그인'}
        </button>
      </form>

      <div className="oauth">
        {/* 백엔드 OAuth2 진입 엔드포인트로 이동하면 구글 동의 화면을 거쳐
            성공 시 /oauth/callback?token=... 으로 돌아옵니다. */}
        <a className="oauth-button" href={`${API_BASE_URL}/oauth2/authorization/google`}>
          구글로 로그인
        </a>
      </div>

      <p className="meta">
        {mode === 'login' ? '계정이 없으신가요? ' : '이미 계정이 있으신가요? '}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setMode(mode === 'login' ? 'signup' : 'login');
            setError(null);
          }}
        >
          {mode === 'login' ? '회원가입' : '로그인'}
        </a>
      </p>

      {error && <div className="error">{error}</div>}
    </div>
  );
}
