import { apiClient } from './client';

/**
 * 문서 기반 질의(RAG) 전용 API (Day 5 심화).
 *
 * plain 채팅의 chat.ts 와 분리된 별도 API 모듈입니다.
 * Spring 게이트웨이의 /rag/* 를 호출하며, apiClient 가 토큰 부착·401 처리를 자동 수행합니다.
 * 서버는 /rag/** 를 인증 필요로 보호하므로 로그인 상태에서만 동작합니다.
 */

export interface RagChatResponse {
  answer: string;
  model: string;
}

/** FastAPI IngestResponse 를 Spring 이 그대로 전달하므로 snake_case 키를 사용합니다. */
export interface RagIngestResponse {
  filename: string;
  pages: number;
  chunks_added: number;
  total_chunks: number;
}

/** 벡터 DB를 검색하는 인사팀 에이전트에게 질의합니다. */
export async function postRagChat(question: string): Promise<RagChatResponse> {
  const { data } = await apiClient.post<RagChatResponse>('/rag/chat', { question });
  return data;
}

/**
 * PDF를 업로드해 벡터 DB에 적재합니다.
 *
 * FormData 를 보내면 axios 가 multipart/form-data 헤더(boundary 포함)를 자동 설정합니다.
 * (브라우저 어댑터가 기본 Content-Type 을 제거하고 직접 채웁니다.)
 * 서버 파트 이름이 "file"이므로 동일하게 맞춥니다.
 */
export async function ingestPdf(file: File): Promise<RagIngestResponse> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await apiClient.post<RagIngestResponse>('/rag/ingest', form);
  return data;
}
