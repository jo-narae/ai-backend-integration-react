import { apiClient } from './client';

export interface LoginResponse {
  token: string;
  username: string;
  role: string;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/login', { username, password });
  return data;
}

export async function signup(username: string, password: string): Promise<void> {
  await apiClient.post('/signup', { username, password });
}
