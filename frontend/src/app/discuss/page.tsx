'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Question } from '@/types';
import { useAuth } from '@/context/AuthContext';

const API = process.env.NEXT_PUBLIC_API_URL;

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function DiscussPage() {
  const { user, token } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', body: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/questions?page=${page}&limit=10`);
      const data = await res.json();
      setQuestions(data.questions || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {}
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.title.trim() || !form.body.trim()) { setFormError('Title and body are required'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ title: '', body: '' });
        setShowForm(false);
        fetchQuestions();
      } else {
        const d = await res.json();
        setFormError(d.error || 'Failed to post');
      }
    } catch { setFormError('Network error'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="section-title">💬 Discussion</h1>
          <p className="text-[var(--text-muted)] text-sm">
            {total} question{total !== 1 ? 's' : ''} — ask anything about colleges
          </p>
        </div>
        {user ? (
          <button
            id="ask-question-btn"
            onClick={() => setShowForm(!showForm)}
            className="btn-primary"
          >
            {showForm ? '✕ Cancel' : '+ Ask Question'}
          </button>
        ) : (
          <Link href="/auth/login" className="btn-outline">Sign in to ask</Link>
        )}
      </div>

      {/* Ask form */}
      {showForm && (
        <div className="card mb-8 fade-in border border-indigo-500/30">
          <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Ask a Question</h2>
          {formError && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{formError}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">Question Title</label>
              <input
                id="question-title"
                type="text"
                placeholder="e.g. What are the hostel facilities at IIT Bombay?"
                className="input-field"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                maxLength={300}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">Details</label>
              <textarea
                id="question-body"
                placeholder="Provide more context or details about your question..."
                className="input-field h-32 resize-none"
                value={form.body}
                onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
                maxLength={2000}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
              <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60">
                {submitting ? 'Posting...' : 'Post Question'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Questions list */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card">
              <div className="skeleton h-5 w-3/4 rounded mb-3" />
              <div className="skeleton h-4 w-full rounded mb-2" />
              <div className="skeleton h-4 w-1/2 rounded" />
            </div>
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-20 card">
          <div className="text-5xl mb-4">🙋</div>
          <h3 className="text-xl font-semibold text-[var(--text)] mb-2">No questions yet</h3>
          <p className="text-[var(--text-muted)]">Be the first to ask a question!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <Link
              key={q.id}
              href={`/discuss/${q.id}`}
              className="card glass-hover block"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-[var(--text)] mb-1.5 line-clamp-2 group-hover:text-indigo-400">
                    {q.title}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] line-clamp-2 mb-3">{q.body}</p>
                  <div className="flex items-center flex-wrap gap-3 text-xs text-[var(--text-dim)]">
                    <span className="flex items-center gap-1">
                      <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-[10px]">
                        {q.author_name[0].toUpperCase()}
                      </span>
                      {q.author_name}
                    </span>
                    {q.college_name && (
                      <span className="tag">📚 {q.college_name}</span>
                    )}
                    <span>🕐 {timeAgo(q.created_at)}</span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-[var(--bg-card2)] border border-[var(--border)] flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-indigo-400">{q.answer_count ?? 0}</span>
                    <span className="text-[10px] text-[var(--text-dim)]">answers</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-ghost disabled:opacity-40">← Prev</button>
          <span className="flex items-center px-4 text-sm text-[var(--text-muted)]">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="btn-ghost disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  );
}
