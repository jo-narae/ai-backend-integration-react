import { apiClient } from './client';

/**
 * 관리자 전용 사용자 관리 API.
 *
 * apiClient가 토큰 부착·401 처리를 자동 수행하므로 별도 인증 로직이 필요 없습니다.
 * 서버는 /admin/** 을 hasRole("ADMIN")로 보호하므로 권한 부족 시 403(FORBIDDEN)이 옵니다.
 */
export interface AdminUser {
  id: number;
  username: string;
  role: string; // 'USER' | 'ADMIN'
}

export async function listUsers(): Promise<AdminUser[]> {
  const { data } = await apiClient.get<AdminUser[]>('/admin/users');
  return data;
}

export async function changeUserRole(id: number, role: string): Promise<AdminUser> {
  const { data } = await apiClient.patch<AdminUser>(`/admin/users/${id}/role`, { role });
  return data;
}

export async function deleteUser(id: number): Promise<void> {
  await apiClient.delete(`/admin/users/${id}`);
}
