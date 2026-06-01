import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { postChat } from '../api/chat';
import { useAuth } from '../auth/AuthContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
}

export default function ChatPage() {
  const { username, clear } = useAuth();
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = () => {
    clear();
    navigate('/login', { replace: true });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed) return;

    setBusy(true);
    setError(null);
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
    setPrompt('');

    try {
      const res = await postChat(trimmed);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.answer, model: res.model },
      ]);
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
      <div className="top">
        <h1>채팅</h1>
        <button type="button" onClick={handleLogout}>
          로그아웃 ({username})
        </button>
      </div>

      {messages.map((m, i) => (
        <div key={i} className={`message ${m.role === 'user' ? 'user' : ''}`}>
          {m.content}
          {m.model && <div className="meta">model: {m.model}</div>}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <label>
          메시지
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="질문을 입력하세요"
            disabled={busy}
          />
        </label>
        <button type="submit" disabled={busy || !prompt.trim()}>
          {busy ? '응답 대기 중...' : '전송'}
        </button>
      </form>

      {error && <div className="error">{error}</div>}
    </div>
  );
}
