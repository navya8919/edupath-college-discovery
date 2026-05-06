'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { College } from '@/types';

const API = process.env.NEXT_PUBLIC_API_URL;

const EXAMS = [
  { id: 'JEE Advanced', label: 'JEE Advanced', icon: '⚙️', desc: 'IITs & Top Engg',       color: '#6366f1' },
  { id: 'JEE Main',     label: 'JEE Main',     icon: '🔬', desc: 'NITs & GFTIs',            color: '#8b5cf6' },
  { id: 'NEET',         label: 'NEET',          icon: '🩺', desc: 'Medical Colleges',        color: '#10b981' },
  { id: 'EAMCET',       label: 'EAMCET',        icon: '📐', desc: 'AP/TS Engineering',       color: '#f97316' },
  { id: 'CAT',          label: 'CAT',           icon: '📊', desc: 'IIMs & MBA',              color: '#f59e0b' },
  { id: 'GATE',         label: 'GATE',          icon: '🎓', desc: 'M.Tech & PSUs',           color: '#38bdf8' },
];

const CATEGORIES = ['General', 'OBC-NCL', 'SC', 'ST', 'EWS'];

const EXAM_INFO: Record<string, { fullName: string; body: string; emoji: string }> = {
  'JEE Advanced': {
    emoji: '⚙️',
    fullName: 'Joint Entrance Exam Advanced',
    body: 'Conducted by IITs. Qualifies candidates for admission to IIT B.Tech programs. Top 2.5 lakh JEE Main qualifiers are eligible.',
  },
  'JEE Main': {
    emoji: '🔬',
    fullName: 'Joint Entrance Exam Main',
    body: 'Conducted by NTA. Gateway to NITs, IIITs, and GFTIs across India. Also qualifies for JEE Advanced.',
  },
  'NEET': {
    emoji: '🩺',
    fullName: 'National Eligibility cum Entrance Test',
    body: 'Only medical entrance exam for MBBS/BDS admissions in India. Conducted by NTA for government and private medical colleges.',
  },
  'EAMCET': {
    emoji: '📐',
    fullName: 'Engineering Agriculture & Medical Common Entrance Test',
    body: 'State-level entrance test for AP and Telangana. Qualifies for B.Tech admissions in government and private colleges in AP/TS.',
  },
  'CAT': {
    emoji: '📊',
    fullName: 'Common Admission Test',
    body: 'Conducted by IIMs for MBA/PGDM admissions. Accepted by IIMs, top B-schools, and many private management institutes.',
  },
  'GATE': {
    emoji: '🎓',
    fullName: 'Graduate Aptitude Test in Engineering',
    body: 'Conducted by IITs/IISc. Required for M.Tech admissions and PSU recruitment (BHEL, ONGC, NTPC, etc.).',
  },
};

interface PredictorResult {
  exam: string;
  rank: number;
  maxNirfRank: number;
  total: number;
  colleges: College[];
}

function ChanceBar({ percentage }: { percentage: number }) {
  const color = percentage >= 80 ? '#10b981' : percentage >= 60 ? '#f59e0b' : '#6366f1';
  return (
    <div className="w-full bg-[var(--bg-card2)] rounded-full h-2 mt-1">
      <div
        className="h-2 rounded-full transition-all duration-700"
        style={{ width: `${percentage}%`, background: color }}
      />
    </div>
  );
}

function ChanceBadge({ pct }: { pct: number }) {
  if (pct >= 85) return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">🟢 High Chance</span>;
  if (pct >= 65) return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">🟡 Moderate</span>;
  return             <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">🔵 Low Chance</span>;
}

export default function PredictorPage() {
  const [exam, setExam]         = useState('JEE Advanced');
  const [rank, setRank]         = useState('');
  const [category, setCategory] = useState('General');
  const [state, setState]       = useState('');
  const [states, setStates]     = useState<string[]>([]);
  const [result, setResult]     = useState<PredictorResult | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [ran, setRan]           = useState(false);

  useEffect(() => {
    fetch(`${API}/api/colleges/states`)
      .then((r) => r.json())
      .then((d) => setStates(d.states || []))
      .catch(() => {});
  }, []);

  // Auto-set state to Telangana when EAMCET is selected
  useEffect(() => {
    if (exam === 'EAMCET') {
      setState((prev) => (prev === '' ? 'Telangana' : prev));
    }
  }, [exam]);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const rankNum = parseInt(rank);
    if (!rankNum || rankNum <= 0) { setError('Please enter a valid positive rank.'); return; }
    setLoading(true);
    setRan(true);
    try {
      const params = new URLSearchParams({ exam, rank, category });
      if (state) params.set('state', state);
      const res = await fetch(`${API}/api/predictor?${params}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to predict'); setResult(null); }
      else setResult(data);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  function getChance(nirfRank: number | null | undefined, maxNirfRank: number): number {
    if (!nirfRank || !maxNirfRank) return 50;
    const ratio = nirfRank / maxNirfRank;
    if (ratio <= 0.25) return 95;
    if (ratio <= 0.5)  return 80;
    if (ratio <= 0.75) return 65;
    return 50;
  }

  const selectedExamInfo = EXAM_INFO[exam];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 fade-in">

      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-indigo-500/30 text-indigo-400 text-sm font-medium mb-5">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          AI-Powered Predictor
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--text)] mb-3">
          🎯 College <span className="gradient-text">Predictor</span>
        </h1>
        <p className="text-[var(--text-muted)] max-w-xl mx-auto">
          Enter your exam and rank to instantly discover which colleges you are eligible for
          based on NIRF rankings and cutoff data.
        </p>
      </div>

      {/* Exam Info Banner */}
      {selectedExamInfo && (
        <div className="mb-6 px-5 py-4 rounded-2xl glass border border-[var(--border)] flex gap-4 items-start fade-in">
          <span className="text-3xl flex-shrink-0 mt-0.5">{selectedExamInfo.emoji}</span>
          <div>
            <p className="text-sm font-bold text-[var(--text)] mb-0.5">{selectedExamInfo.fullName}</p>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">{selectedExamInfo.body}</p>
          </div>
        </div>
      )}

      {/* Form Card */}
      <div className="card border border-indigo-500/20 mb-8">
        <form onSubmit={handlePredict} className="space-y-6">

          {/* Exam Selector */}
          <div>
            <label className="block text-sm font-semibold text-[var(--text-muted)] mb-3">
              Select Your Exam
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {EXAMS.map((ex) => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => setExam(ex.id)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all duration-200 text-center ${
                    exam === ex.id
                      ? 'border-indigo-500 bg-indigo-500/10 text-[var(--text)] scale-[1.03] shadow-lg shadow-indigo-500/10'
                      : 'border-[var(--border)] hover:border-indigo-500/40 text-[var(--text-muted)]'
                  }`}
                >
                  <span className="text-2xl">{ex.icon}</span>
                  <span className="text-xs font-bold leading-tight">{ex.label}</span>
                  <span className="text-[10px] text-[var(--text-dim)] leading-tight hidden sm:block">{ex.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Rank + Category + State */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--text-muted)] mb-1.5">
                Your Rank / Score
              </label>
              <input
                id="predictor-rank"
                type="number"
                min="1"
                required
                placeholder={exam === 'EAMCET' ? 'e.g. 15000' : 'e.g. 5000'}
                className="input-field"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--text-muted)] mb-1.5">
                Category
              </label>
              <select
                id="predictor-category"
                className="input-field"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--text-muted)] mb-1.5">
                State Preference{' '}
                {exam === 'EAMCET' && <span className="text-orange-400 font-normal text-xs">(AP/TS recommended)</span>}
                {exam !== 'EAMCET' && <span className="text-[var(--text-dim)] font-normal">(optional)</span>}
              </label>
              <select
                id="predictor-state"
                className="input-field"
                value={state}
                onChange={(e) => setState(e.target.value)}
              >
                <option value="">All India</option>
                {states.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
              ⚠️ {error}
            </div>
          )}

          <button
            id="predict-btn"
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-3.5 text-base disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Predicting...
              </span>
            ) : `🔮 Predict My Colleges for ${exam}`}
          </button>
        </form>
      </div>

      {/* Results */}
      {ran && !loading && (
        <div className="fade-in">
          {result && result.colleges.length > 0 ? (
            <>
              {/* Summary */}
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <div>
                  <h2 className="text-xl font-bold text-[var(--text)]">
                    {result.colleges.length} College{result.colleges.length !== 1 ? 's' : ''} Found
                  </h2>
                  <p className="text-sm text-[var(--text-muted)]">
                    Based on <span className="text-indigo-400 font-medium">{result.exam}</span> rank{' '}
                    <span className="text-indigo-400 font-medium">#{result.rank.toLocaleString()}</span>
                    {category !== 'General' && ` — ${category} category`}
                    {state && ` — ${state}`}
                  </p>
                </div>
                <span className="tag text-xs">
                  🏆 Eligible up to NIRF Rank #{result.maxNirfRank}
                </span>
              </div>

              {/* College Cards */}
              <div className="space-y-4">
                {result.colleges.map((college, idx) => {
                  const chance = getChance(college.ranking, result.maxNirfRank);
                  return (
                    <div
                      key={college.id}
                      className="card glass-hover flex flex-col sm:flex-row gap-4"
                      style={{ animationDelay: `${idx * 80}ms` }}
                    >
                      {/* Rank badge */}
                      <div className="flex-shrink-0 flex sm:flex-col items-center sm:justify-start gap-3 sm:gap-1 sm:w-16">
                        <span
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                        >
                          {idx + 1}
                        </span>
                        {college.ranking && (
                          <span className="text-[10px] text-[var(--text-dim)] text-center leading-tight">
                            NIRF<br />#{college.ranking}
                          </span>
                        )}
                      </div>

                      {/* Logo */}
                      <div className="w-12 h-12 rounded-xl bg-[var(--bg-card2)] flex items-center justify-center flex-shrink-0 self-start overflow-hidden">
                        {college.image_url ? (
                          <div className="relative w-full h-full">
                            <Image src={college.image_url} alt={college.name} fill className="object-contain p-1" />
                          </div>
                        ) : <span className="text-2xl">🎓</span>}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`badge ${college.type === 'Government' ? 'badge-gov' : 'badge-priv'}`}>
                            {college.type === 'Government' ? '🏛️' : '🏢'} {college.type}
                          </span>
                          {college.accreditation && (
                            <span className="badge badge-priv">⭐ {college.accreditation}</span>
                          )}
                          <ChanceBadge pct={chance} />
                        </div>
                        <Link
                          href={`/colleges/${college.id}`}
                          className="text-base font-semibold text-[var(--text)] hover:text-indigo-400 transition-colors leading-snug block mb-1"
                        >
                          {college.name}
                        </Link>
                        <p className="text-xs text-[var(--text-muted)] mb-3">📍 {college.location}</p>

                        <div className="grid grid-cols-3 gap-2 text-center mb-3">
                          <div className="bg-[var(--bg-card2)] rounded-lg p-2">
                            <div className="text-[10px] text-[var(--text-dim)]">💰 Fees/yr</div>
                            <div className="text-sm font-semibold text-[var(--text)]">
                              ₹{(college.fees_min / 100000).toFixed(1)}L
                            </div>
                          </div>
                          <div className="bg-[var(--bg-card2)] rounded-lg p-2">
                            <div className="text-[10px] text-[var(--text-dim)]">⭐ Rating</div>
                            <div className="text-sm font-semibold text-amber-400">
                              {college.rating.toFixed(1)}
                            </div>
                          </div>
                          <div className="bg-[var(--bg-card2)] rounded-lg p-2">
                            <div className="text-[10px] text-[var(--text-dim)]">🎯 Placement</div>
                            <div className="text-sm font-semibold text-emerald-400">
                              {college.placement_percentage ? `${college.placement_percentage}%` : 'N/A'}
                            </div>
                          </div>
                        </div>

                        {/* Admission chance bar */}
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-[var(--text-dim)]">🎲 Admission Chance</span>
                            <span className="font-semibold text-[var(--text)]">{chance}%</span>
                          </div>
                          <ChanceBar percentage={chance} />
                        </div>
                      </div>

                      <div className="flex sm:flex-col gap-2 self-start sm:self-center flex-shrink-0">
                        <Link href={`/colleges/${college.id}`} className="btn-primary text-xs py-1.5 px-4">
                          Details →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Disclaimer */}
              <div className="mt-6 px-4 py-4 rounded-xl glass border border-[var(--border)] text-xs text-[var(--text-dim)] leading-relaxed">
                ⚠️ <strong className="text-[var(--text-muted)]">Disclaimer:</strong> This predictor is based on NIRF rankings and general cutoff patterns.
                Actual admissions depend on your category, counselling round, seat availability, branch preferences, and domicile state.
                For EAMCET, refer to AP/TS official counselling authorities (TSCHE / APSCHE).
                Always verify with official sources before making decisions.
              </div>
            </>
          ) : (
            <div className="card text-center py-16">
              <div className="text-6xl mb-4">😕</div>
              <h3 className="text-xl font-semibold text-[var(--text)] mb-2">No colleges found</h3>
              <p className="text-[var(--text-muted)] mb-6 max-w-sm mx-auto">
                No colleges in our database match your rank and filters.
                Try a different exam, higher rank, or remove the state filter.
              </p>
              <button
                onClick={() => { setRank(''); setExam('JEE Advanced'); setState(''); setRan(false); setResult(null); }}
                className="btn-outline"
              >
                🔄 Reset & Try Again
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tips when not yet searched */}
      {!ran && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {[
            { icon: '⚡', title: 'Instant Results',      desc: 'Get college predictions in under a second based on real NIRF data.' },
            { icon: '📋', title: '6 Exams Supported',    desc: 'JEE Advanced, JEE Main, NEET, EAMCET, CAT and GATE all supported.' },
            { icon: '🗺️', title: 'State Preference',     desc: 'Filter by state — EAMCET auto-selects Telangana for AP/TS colleges.' },
          ].map((tip) => (
            <div key={tip.title} className="card glass-hover text-center">
              <div className="text-3xl mb-3">{tip.icon}</div>
              <h3 className="text-sm font-semibold text-[var(--text)] mb-1">{tip.title}</h3>
              <p className="text-xs text-[var(--text-muted)]">{tip.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
