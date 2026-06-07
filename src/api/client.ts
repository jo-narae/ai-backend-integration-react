import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

/**
 * axios 공용 인스턴스.
 *
 * - 모든 요청에 Authorization 헤더 자동 부착
 * - 401 응답 시 토큰을 비우고 /login으로 리다이렉트
 */
/** Spring 게이트웨이 베이스 URL. 구글 OAuth2 진입 링크 등에서도 재사용합니다. */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60_000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  // 파일 업로드(FormData)는 Content-Type을 지워 브라우저가 multipart/form-data; boundary=... 를
  // 직접 설정하게 합니다. 인스턴스 기본값 application/json 이 남으면 axios가 FormData를 JSON으로
  // 직렬화해, 서버가 "Content-Type 'application/json' is not supported"로 거부합니다.
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    config.headers.delete('Content-Type');
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      // SPA 라우터 영역 밖에서 호출되므로 window.location 사용
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
