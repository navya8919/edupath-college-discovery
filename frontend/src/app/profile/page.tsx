'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { College } from '@/types';
import { useAuth } from '@/context/AuthContext';
import CollegeCard from '@/components/CollegeCard';

const API = process.env.NEXT_PUBLIC_API_URL;

interface SavedComparison {
  id: string;
  college_ids: string | string[];
  name: string;
  created_at: string;
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

type Tab = 'saved' | 'comparisons';

export default function ProfilePage() {
  const { user, token, logout, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>('saved');
  const [saved, setSaved] = useState<College[]>([]);
  const [comparisons, setComparisons] = useState<SavedComparison[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [loadingComparisons, setLoadingComparisons] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/user/saved`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setSaved(d.saved || []))
      .catch(() => {})
      .finally(() => setLoadingSaved(false));

    fetch(`${API}/api/user/comparisons`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setComparisons(d.comparisons || []))
      .catch(() => {})
      .finally(() => setLoadingComparisons(false));
  }, [token]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="spinner" />
      </div>
    );
  }

  if (!user) return null;

  const initials = user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  function getCompareIds(c: SavedComparison): string[] {
    if (Array.isArray(c.college_ids)) return c.college_ids;
    try { return JSON.parse(c.college_ids); } catch { return []; }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 fade-in">
      {/* Profile Hero */}
      <div className="card mb-8" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))', borderColor: 'rgba(99,102,241,0.25)' }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            {initials}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[var(--text)]">{user.name}</h1>
            <p className="text-[var(--text-muted)] text-sm mt-0.5">{user.email}</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <div className="flex items-center gap-2 bg-[var(--bg-card2)] rounded-xl px-4 py-2">
                <span className="text-red-400 text-lg">❤️</span>
                <div>
                  <div className="text-base font-bold text-[var(--text)]">{saved.length}</div>
                  <div className="text-[10px] text-[var(--text-dim)]">Saved</div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-[var(--bg-card2)] rounded-xl px-4 py-2">
                <span className="text-indigo-400 text-lg">⚖️</span>
                <div>
                  <div className="text-base font-bold text-[var(--text)]">{comparisons.length}</div>
                  <div className="text-[10px] text-[var(--text-dim)]">Comparisons</div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => { logout(); router.push('/'); }}
            className="btn-ghost text-sm self-start sm:self-auto text-[var(--danger)] border-red-500/30 hover:bg-red-500/10"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link href="/colleges" className="btn-outline text-sm">🔍 Browse Colleges</Link>
        <Link href="/compare" className="btn-outline text-sm">⚖️ New Comparison</Link>
        <Link href="/predictor" className="btn-outline text-sm">🎯 Predictor</Link>
        <Link href="/discuss" className="btn-outline text-sm">💬 Discussions</Link>
      </div>

      {/* Tabs */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex border-b border-[var(--border)]">
          {[
            { key: 'saved' as Tab,       label: `❤️ Saved Colleges (${saved.length})` },
            { key: 'comparisons' as Tab, label: `⚖️ Saved Comparisons (${comparisons.length})` },
          ].map((t) => (
            <button
              key={t.key}
              id={`tab-${t.key}`}
              onClick={() => setTab(t.key)}
              className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-all ${
                tab === t.key
                  ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/3'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Saved Colleges */}
          {tab === 'saved' && (
            <div className="fade-in">
              {loadingSaved ? (
                <div className="flex justify-center py-10"><div className="spinner" /></div>
              ) : saved.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">🤍</div>
                  <h3 className="text-lg font-semibold text-[var(--text)] mb-2">No saved colleges yet</h3>
                  <p className="text-[var(--text-muted)] mb-6 text-sm">Browse colleges and click ❤️ to save them here.</p>
                  <Link href="/colleges" className="btn-primary">Browse Colleges →</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {saved.map((c) => <CollegeCard key={c.id} college={c} />)}
                </div>
              )}
            </div>
          )}

          {/* Saved Comparisons */}
          {tab === 'comparisons' && (
            <div className="fade-in">
              {loadingComparisons ? (
                <div className="flex justify-center py-10"><div className="spinner" /></div>
              ) : comparisons.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">⚖️</div>
                  <h3 className="text-lg font-semibold text-[var(--text)] mb-2">No saved comparisons</h3>
                  <p className="text-[var(--text-muted)] mb-6 text-sm">Compare colleges and save the comparison to view it here.</p>
                  <Link href="/colleges" className="btn-primary">Start Comparing →</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {comparisons.map((comp) => {
                    const ids = getCompareIds(comp);
                    return (
                      <div key={comp.id} className="glass rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
                        <div>
                          <div className="font-semibold text-[var(--text)] mb-1">{comp.name}</div>
                          <div className="text-xs text-[var(--text-dim)]">
                            {ids.length} college{ids.length !== 1 ? 's' : ''} • Saved {timeAgo(comp.created_at)}
                          </div>
                        </div>
                        <Link
                          href={`/compare?ids=${ids.join(',')}`}
                          className="btn-outline text-sm flex-shrink-0"
                        >
                          View Comparison →
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
