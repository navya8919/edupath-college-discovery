'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Question, Answer } from '@/types';
import { useAuth } from '@/context/AuthContext';

const API = process.env.NEXT_PUBLIC_API_URL;

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function QuestionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, token } = useAuth();
  const router = useRouter();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [answerBody, setAnswerBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API}/api/questions/${id}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => { setQuestion(d.question); setAnswers(d.answers || []); })
      .catch(() => setError('Question not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerBody.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/questions/${id}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ body: answerBody }),
      });
      if (res.ok) {
        const d = await res.json();
        setAnswers((prev) => [...prev, d.answer]);
        setAnswerBody('');
      }
    } catch {}
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="spinner" /></div>;
  if (error || !question) return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <p className="text-[var(--danger)] mb-4">{error || 'Not found'}</p>
      <Link href="/discuss" className="btn-primary">← Back to Discuss</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-6">
        <Link href="/discuss" className="hover:text-indigo-400 transition-colors">Discussion</Link>
        <span>/</span>
        <span className="text-[var(--text)] truncate max-w-xs">{question.title}</span>
      </nav>

      {/* Question */}
      <div className="card mb-6">
        <h1 className="text-xl font-bold text-[var(--text)] mb-4 leading-snug">{question.title}</h1>
        <p className="text-[var(--text-muted)] leading-relaxed whitespace-pre-wrap mb-5">{question.body}</p>
        <div className="flex items-center flex-wrap gap-3 text-xs text-[var(--text-dim)] pt-4 border-t border-[var(--border)]">
          <span className="flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-[10px]">
              {question.author_name[0].toUpperCase()}
            </span>
            {question.author_name}
          </span>
          {question.college_name && (
            <span className="tag">📚 {question.college_name}</span>
          )}
          <span>🕐 {timeAgo(question.created_at)}</span>
        </div>
      </div>

      {/* Answers */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[var(--text)] mb-4">
          {answers.length} Answer{answers.length !== 1 ? 's' : ''}
        </h2>
        {answers.length === 0 ? (
          <div className="card text-center py-8">
            <div className="text-4xl mb-3">💭</div>
            <p className="text-[var(--text-muted)] text-sm">No answers yet. Be the first to answer!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {answers.map((a) => (
              <div key={a.id} className="card fade-in">
                <p className="text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-wrap mb-4">{a.body}</p>
                <div className="flex items-center gap-3 text-xs text-[var(--text-dim)] pt-3 border-t border-[var(--border)]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-[10px]">
                      {a.author_name[0].toUpperCase()}
                    </span>
                    {a.author_name}
                  </span>
                  <span>🕐 {timeAgo(a.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Answer form */}
      {user ? (
        <div className="card border border-indigo-500/20">
          <h3 className="text-base font-semibold text-[var(--text)] mb-4">Your Answer</h3>
          <form onSubmit={handleAnswer}>
            <textarea
              id="answer-input"
              placeholder="Write your answer here..."
              className="input-field h-32 resize-none mb-4"
              value={answerBody}
              onChange={(e) => setAnswerBody(e.target.value)}
            />
            <div className="flex justify-end">
              <button id="submit-answer-btn" type="submit" disabled={submitting || !answerBody.trim()} className="btn-primary disabled:opacity-60">
                {submitting ? 'Posting...' : 'Post Answer'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="card text-center py-8">
          <p className="text-[var(--text-muted)] mb-4">Sign in to post an answer</p>
          <button onClick={() => router.push('/auth/login')} className="btn-primary">Sign in →</button>
        </div>
      )}
    </div>
  );
}
