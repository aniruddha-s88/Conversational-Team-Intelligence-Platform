import React, { useState, useEffect, useRef } from 'react';
import { askQuestion, getSuggestions, getQueryHistory } from '../api';
import toast from 'react-hot-toast';

export default function QueryPage() {
  const [question, setQuestion] = useState('');
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const answerRef = useRef(null);

  useEffect(() => {
    getSuggestions().then(r => setSuggestions(r.data.suggestions)).catch(() => {});
    getQueryHistory().then(r => setHistory(r.data)).catch(() => {});
  }, []);

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const r = await askQuestion({ question, days_context: days });
      setResult(r.data);
      getQueryHistory().then(r => setHistory(r.data)).catch(() => {});
      setTimeout(() => answerRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Error getting answer. Check your GROQ_API_KEY.');
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAsk();
  };

  return (
    <div>
      <div className="section-title">Ask Your Team</div>
      <div className="section-sub">Ask anything about your team's updates — get a clear, AI-powered answer</div>

      <div className="chat-input-area mb-4">
        <div className="mb-3">
          <textarea
            rows={3}
            className="form-control form-control-dark"
            placeholder="e.g. 'What's pending from this week?' or 'Did anyone follow up with Rajan?'"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <small style={{ color: 'var(--text-secondary)' }}>Ctrl+Enter to send</small>
        </div>
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <div className="d-flex align-items-center gap-2">
            <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
              Look back:
            </label>
            <select
              className="form-select form-select-sm form-select-dark"
              style={{ width: 130 }}
              value={days}
              onChange={e => setDays(Number(e.target.value))}
            >
              <option value={1}>Today</option>
              <option value={3}>Last 3 days</option>
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 2 weeks</option>
              <option value={30}>Last month</option>
            </select>
          </div>
          <button
            className="btn btn-accent ms-auto"
            onClick={handleAsk}
            disabled={loading || !question.trim()}
          >
            {loading ? (
              <><span className="spinner-border spinner-border-sm spinner-accent me-2"></span>Thinking<span className="loading-dots"></span></>
            ) : (
              <><i className="bi bi-send-fill me-2"></i>Ask</>
            )}
          </button>
        </div>
      </div>

      {/* Suggestions */}
      <div className="mb-4">
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Try asking:
        </div>
        <div className="d-flex flex-wrap gap-2">
          {suggestions.map((s, i) => (
            <span key={i} className="suggestion-chip" onClick={() => setQuestion(s)}>{s}</span>
          ))}
        </div>
      </div>

      {/* Answer */}
      {result && (
        <div ref={answerRef} className="mb-4">
          <div className="d-flex align-items-center gap-2 mb-3">
            <i className="bi bi-robot" style={{ color: 'var(--accent)' }}></i>
            <span style={{ fontWeight: 600 }}>AI Answer</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
              Based on {result.messages_analyzed} messages
            </span>
          </div>
          <div className="answer-card">{result.answer}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 8 }}>
            <i className="bi bi-info-circle me-1"></i>
            Powered by Groq · LLaMA 3 70B · Not a substitute for direct team communication
          </div>
        </div>
      )}

      {/* History */}
      <div>
        <div
          className="d-flex align-items-center gap-2 mb-3"
          style={{ cursor: 'pointer' }}
          onClick={() => setShowHistory(h => !h)}
        >
          <i className="bi bi-clock-history" style={{ color: 'var(--text-secondary)' }}></i>
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Previous Questions</span>
          <i className={`bi bi-chevron-${showHistory ? 'up' : 'down'} ms-auto`} style={{ color: 'var(--text-secondary)' }}></i>
        </div>
        {showHistory && history.map((h, i) => (
          <div key={i} className="history-item">
            <div className="history-q"><i className="bi bi-question-circle me-2"></i>{h.question}</div>
            <div className="history-a">{h.answer.substring(0, 300)}{h.answer.length > 300 ? '...' : ''}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 6 }}>{h.created_at}</div>
          </div>
        ))}
        {showHistory && history.length === 0 && (
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No questions asked yet.</div>
        )}
      </div>
    </div>
  );
}
