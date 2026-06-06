import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from './AuthContext';

/**
 * 인증되지 않은 사용자를 /login으로 보냅니다.
 *
 * requireRole이 주어지면 역할까지 검사합니다.
 * 인증은 됐지만 역할이 부족한 사용자는 /chat으로 돌려보냅니다.
 * (서버는 /admin/** 을 hasRole("ADMIN")로 한 번 더 막으므로 이 가드는 UX용 1차 차단입니다.)
 */
export default function ProtectedRoute({
  children,
  requireRole,
}: {
  children: ReactNode;
  requireRole?: 'ADMIN' | 'USER';
}) {
  const { token, role } = useAuth();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (requireRole && role !== requireRole) {
    return <Navigate to="/chat" replace />;
  }

  return <>{children}</>;
}
