import { apiClient } from './client';

export interface ChatResponse {
  answer: string;
  model: string;
}

export async function postChat(prompt: string): Promise<ChatResponse> {
  const { data } = await apiClient.post<ChatResponse>('/chat', { prompt });
  return data;
}
