# ai-backend-integration-react (Day 5 시연용)

Vite + React + TypeScript + axios + react-router-dom으로 만든 보일러플레이트입니다. 학생이 직접 코딩하지 않고 강사가 시연만 합니다.

## 사전 요구사항

- Node.js 20 LTS
- Spring 서버(`ai-backend-integration-spring`)가 8080 포트에서 동작 중
- Python FastAPI(`ai-backend-integration-python`)가 8000 포트에서 동작 중

## 셋업

```bash
# 의존성 설치
npm install

# 환경변수 (Spring 게이트웨이 URL)
cp .env.example .env

# 개발 서버 (포트 5173)
npm run dev
```

브라우저에서 <http://localhost:5173> 으로 접속하실 수 있습니다.

## 화면 흐름

1. `/` 접근 시 `/chat`으로 리다이렉트 → 토큰 없으면 `/login`으로 다시 이동
2. `/login`에서 회원가입 또는 로그인 → 성공 시 토큰을 `localStorage`에 저장 → `/chat`으로 이동
3. `/chat`에서 메시지 입력 → Spring `/chat` 호출 → Spring이 FastAPI를 거쳐 OpenAI 응답을 반환
4. 토큰 만료/누락 시 401 → 자동으로 `/login`으로 복귀

## 디렉터리 구조

```
src/
├── main.tsx              엔트리, AuthProvider 래핑
├── App.tsx               라우트 정의 (/, /login, /chat)
├── styles.css            최소 스타일
├── api/
│   ├── client.ts         axios 인스턴스 + 401 인터셉터
│   ├── auth.ts           login / signup
│   └── chat.ts           postChat
├── auth/
│   ├── AuthContext.tsx   React Context로 token/username 보관
│   └── ProtectedRoute.tsx  토큰 없으면 /login으로 리다이렉트
└── pages/
    ├── LoginPage.tsx
    └── ChatPage.tsx
```

## 강의 시연 시나리오 (Day 5 B4 ~ B5)

| 단계 | 시연 내용 | 학생에게 강조할 점 |
|------|----------|------------------|
| 1 | `npm run dev`로 서버 기동, 브라우저로 접속 | 별도 빌드 없이 Vite HMR로 즉시 동작 |
| 2 | `/login`에서 회원가입 → JWT 발급 받는 흐름 | `Authorization: Bearer` 헤더 자동 부착 (axios 인터셉터) |
| 3 | 채팅 입력 → AI 응답 표시 | Spring이 FastAPI를 호출하는 풀체인 |
| 4 | localStorage의 토큰을 강제 삭제 → 새로고침 | 401 인터셉터가 자동으로 `/login`으로 복귀 |
| 5 | DevTools Network 탭에서 `/chat` 요청 헤더 확인 | JWT가 어떻게 실려 가는지 시각화 |

## E2E 단골 오류 디버깅 (Day 5 B5)

| 증상 | 원인 | 확인 위치 |
|------|------|----------|
| Network 탭에 CORS preflight 실패 | Spring CORS 설정 누락 | Spring `CorsConfig`의 `allowedOrigins` |
| 401 Unauthorized | 토큰 누락 또는 만료 | DevTools Application → localStorage |
| 415 Unsupported Media Type | `Content-Type` 누락 | axios 인스턴스 기본 헤더 |
| 5xx | Python FastAPI 미기동 또는 OpenAI 키 누락 | FastAPI 콘솔 로그 |

## 빌드

```bash
npm run build      # dist/ 생성
npm run preview    # 빌드 결과 확인
```
