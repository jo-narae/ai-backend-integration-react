import { ChangeEvent, FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ingestPdf, postRagChat, RagIngestResponse } from '../api/rag';
import { useAuth } from '../auth/AuthContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
}

/**
 * 문서 기반 질의(RAG) 화면 (Day 5 심화).
 *
 * plain 채팅 화면(ChatPage)과 분리된 별도 페이지입니다.
 * 1) PDF를 업로드해 벡터 DB에 적재(/rag/ingest)
 * 2) 적재된 문서 근거로 질의(/rag/chat)
 */
export default function RagPage() {
  const { username, role, clear } = useAuth();
  const navigate = useNavigate();

  // 업로드 영역
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [ingest, setIngest] = useState<RagIngestResponse | null>(null);

  // 질의 영역
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleLogout = () => {
    clear();
    navigate('/login', { replace: true });
  };

  const describeError = (err: unknown): string => {
    if (axios.isAxiosError(err)) {
      return err.response?.data?.message ?? err.message;
    }
    return String(err);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
    setIngest(null);
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const res = await ingestPdf(file);
      setIngest(res);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setUploading(false);
    }
  };

  const handleAsk = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed) return;

    setBusy(true);
    setError(null);
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
    setQuestion('');

    try {
      const res = await postRagChat(trimmed);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.answer, model: res.model },
      ]);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container">
      <div className="top">
        <h1>문서 기반 질의 (RAG)</h1>
        <div className="actions">
          <Link to="/chat">채팅</Link>
          {role === 'ADMIN' && <Link to="/admin">관리자</Link>}
          <button type="button" onClick={handleLogout}>
            로그아웃 ({username})
          </button>
        </div>
      </div>

      {/* 1) PDF 업로드 → 벡터 DB 적재 */}
      <section className="section">
        <h2>1. 문서 업로드</h2>
        <form onSubmit={handleUpload}>
          <label>
            PDF 파일
            <input type="file" accept="application/pdf,.pdf" onChange={handleFileChange} disabled={uploading} />
          </label>
          <button type="submit" disabled={uploading || !file}>
            {uploading ? '적재 중...' : '업로드'}
          </button>
        </form>
        {ingest && (
          <div className="ingest-result">
            <strong>{ingest.filename}</strong> 적재 완료 — 페이지 {ingest.pages}개, 이번 청크 {ingest.chunks_added}개
            (누적 {ingest.total_chunks}개)
          </div>
        )}
      </section>

      {/* 2) 적재된 문서 근거로 질의 */}
      <section className="section">
        <h2>2. 문서에 질문하기</h2>
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.role === 'user' ? 'user' : ''}`}>
            {m.content}
            {m.model && <div className="meta">model: {m.model}</div>}
          </div>
        ))}
        <form onSubmit={handleAsk}>
          <label>
            질문
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="업로드한 문서에 대해 질문하세요"
              disabled={busy}
            />
          </label>
          <button type="submit" disabled={busy || !question.trim()}>
            {busy ? '응답 대기 중...' : '전송'}
          </button>
        </form>
      </section>

      {error && <div className="error">{error}</div>}
    </div>
  );
}
