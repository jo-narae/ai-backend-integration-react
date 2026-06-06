import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { listUsers, changeUserRole, deleteUser, AdminUser } from '../api/admin';
import { useAuth } from '../auth/AuthContext';

/**
 * 관리자 전용 사용자 관리 페이지.
 *
 * ChatPage 구조(.container > .top > 목록 > .error)를 그대로 따릅니다.
 * /admin 라우트는 App.tsx에서 requireRole="ADMIN" 가드로 보호합니다.
 */
export default function AdminPage() {
  const { username, clear } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const toMessage = (err: unknown): string =>
    axios.isAxiosError(err) ? err.response?.data?.message ?? err.message : String(err);

  const load = async () => {
    try {
      setUsers(await listUsers());
      setError(null);
    } catch (err) {
      setError(toMessage(err));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRole = async (id: number, role: string) => {
    setBusy(true);
    setError(null);
    try {
      await changeUserRole(id, role);
      await load();
    } catch (err) {
      setError(toMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`${name} 사용자를 삭제하시겠습니까?`)) return;
    setBusy(true);
    setError(null);
    try {
      await deleteUser(id);
      await load();
    } catch (err) {
      setError(toMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = () => {
    clear();
    navigate('/login', { replace: true });
  };

  return (
    <div className="container">
      <div className="top">
        <h1>사용자 관리</h1>
        <button type="button" onClick={handleLogout}>
          로그아웃 ({username})
        </button>
      </div>

      {users.map((u) => (
        <div key={u.id} className="message">
          <strong>{u.username}</strong>
          <div className="meta">role: {u.role}</div>
          <div className="actions">
            <button
              type="button"
              disabled={busy}
              onClick={() => handleRole(u.id, u.role === 'ADMIN' ? 'USER' : 'ADMIN')}
            >
              {u.role === 'ADMIN' ? 'USER로 강등' : 'ADMIN으로 승격'}
            </button>
            <button type="button" disabled={busy} onClick={() => handleDelete(u.id, u.username)}>
              삭제
            </button>
          </div>
        </div>
      ))}

      {error && <div className="error">{error}</div>}
    </div>
  );
}
