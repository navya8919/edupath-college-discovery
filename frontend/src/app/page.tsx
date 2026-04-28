'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { College } from '@/types';
import CollegeCard from '@/components/CollegeCard';

const API = process.env.NEXT_PUBLIC_API_URL;

const features = [
  { icon: '🔍', title: 'Smart Search', desc: 'Search and filter colleges by location, fees, type, placement and more.' },
  { icon: '⚖️', title: 'Side-by-Side Compare', desc: 'Compare up to 3 colleges with a detailed breakdown of every metric.' },
  { icon: '❤️', title: 'Save & Shortlist', desc: 'Save your favourite colleges and build your shortlist after signing in.' },
  { icon: '💬', title: 'Community Q&A', desc: 'Ask questions, share insights, and get answers from the community.' },
];

const stats = [
  { value: '12+', label: 'Top Colleges' },
  { value: '4', label: 'Features' },
  { value: '100%', label: 'Free' },
  { value: '⭐ 4.5', label: 'Avg Rating' },
];

const examPredictor = [
  { exam: 'JEE Advanced', rank: 1000, colleges: ['IIT Bombay', 'IIT Delhi', 'IIT Madras'] },
  { exam: 'JEE Advanced', rank: 5000, colleges: ['IIT Madras', 'NIT Trichy', 'Delhi Technological University'] },
  { exam: 'JEE Main', rank: 10000, colleges: ['NIT Trichy', 'Delhi Technological University', 'BITS Pilani'] },
  { exam: 'JEE Main', rank: 50000, colleges: ['VIT University', 'SRM Institute', 'Manipal Institute of Technology'] },
];

export default function HomePage() {
  const [topColleges, setTopColleges] = useState<College[]>([]);
  const [loadingColleges, setLoadingColleges] = useState(true);
  const [predictor, setPredictor] = useState({ exam: 'JEE Advanced', rank: '' });
  const [predictedColleges, setPredictedColleges] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${API}/api/colleges?sort=ranking&limit=4`)
      .then((r) => r.json())
      .then((d) => setTopColleges(d.colleges || []))
      .catch(() => { })
      .finally(() => setLoadingColleges(false));
  }, []);

  const handlePredict = (e: React.FormEvent) => {
    e.preventDefault();
    const rank = parseInt(predictor.rank);
    if (!rank || rank <= 0) return;
    let result: string[] = [];
    if (predictor.exam === 'JEE Advanced') {
      if (rank <= 1000) result = examPredictor[0].colleges;
      else if (rank <= 5000) result = examPredictor[1].colleges;
      else result = examPredictor[2].colleges;
    } else {
      if (rank <= 10000) result = examPredictor[2].colleges;
      else result = examPredictor[3].colleges;
    }
    setPredictedColleges(result);
  };

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-[88vh] flex items-center justify-center px-4 py-24">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
            style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl"
            style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5 blur-3xl"
            style={{ background: 'radial-gradient(circle, #38bdf8, transparent)' }} />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-indigo-500/30 text-indigo-400 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            India&apos;s College Discovery Platform
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-[var(--text)] leading-[1.1] mb-6">
            Find Your{' '}
            <span className="gradient-text">Perfect College</span>
          </h1>

          <p className="text-lg sm:text-xl text-[var(--text-muted)] max-w-2xl mx-auto mb-10 leading-relaxed">
            Explore, compare and shortlist top colleges across India.
            Real data on fees, placements, courses, and campus life — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/colleges" id="explore-btn" className="btn-primary text-base px-8 py-3.5">
              Explore Colleges →
            </Link>
            <Link href="/compare" className="btn-outline text-base px-8 py-3.5">
              ⚖️ Compare Now
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="glass rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold gradient-text">{s.value}</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title">Everything You Need</h2>
            <p className="text-[var(--text-muted)] max-w-xl mx-auto">
              Make smarter college decisions with our comprehensive toolkit
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card glass-hover text-center">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-base font-semibold text-[var(--text)] mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Colleges */}
      <section className="py-20 px-4 border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h2 className="section-title">Top Ranked Colleges</h2>
              <p className="text-[var(--text-muted)] text-sm">Based on NIRF rankings 2023</p>
            </div>
            <Link href="/colleges" className="btn-outline text-sm">View All →</Link>
          </div>

          {loadingColleges ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card">
                  <div className="skeleton h-36 rounded-xl mb-4" />
                  <div className="skeleton h-5 w-3/4 rounded mb-2" />
                  <div className="skeleton h-4 w-1/2 rounded mb-4" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="skeleton h-14 rounded-lg" />
                    <div className="skeleton h-14 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {topColleges.map((c) => <CollegeCard key={c.id} college={c} />)}
            </div>
          )}
        </div>
      </section>

      {/* Predictor Tool */}
      <section className="py-20 px-4 border-t border-[var(--border)]">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="section-title">🎯 College Predictor</h2>
            <p className="text-[var(--text-muted)]">Enter your exam and rank to see which colleges you may get</p>
          </div>
          <div className="card border border-indigo-500/20">
            <form onSubmit={handlePredict} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">Exam</label>
                <select
                  id="predictor-exam"
                  className="input-field"
                  value={predictor.exam}
                  onChange={(e) => setPredictor((p) => ({ ...p, exam: e.target.value }))}
                >
                  <option value="JEE Advanced">JEE Advanced</option>
                  <option value="JEE Main">JEE Main</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">Your Rank</label>
                <input
                  id="predictor-rank"
                  type="number"
                  min="1"
                  placeholder="e.g. 5000"
                  className="input-field"
                  value={predictor.rank}
                  onChange={(e) => setPredictor((p) => ({ ...p, rank: e.target.value }))}
                  required
                />
              </div>
              <button type="submit" id="predict-btn" className="btn-primary w-full justify-center py-3">
                🔮 Predict Colleges
              </button>
            </form>

            {predictedColleges.length > 0 && (
              <div className="mt-6 pt-6 border-t border-[var(--border)] fade-in">
                <h3 className="text-sm font-semibold text-[var(--text-muted)] mb-3">Likely colleges for you:</h3>
                <div className="space-y-2">
                  {predictedColleges.map((c, i) => (
                    <div key={c} className="flex items-center gap-3 bg-[var(--bg-card2)] rounded-xl px-4 py-3">
                      <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium text-[var(--text)]">{c}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[var(--text-dim)] mt-3">
                  * This is a simplified predictor based on general cutoffs. Actual admissions depend on category, preferences, and availability.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 border-t border-[var(--border)]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))', borderColor: 'rgba(99,102,241,0.3)' }}>
            <h2 className="text-3xl font-bold text-[var(--text)] mb-3">Ready to find your college?</h2>
            <p className="text-[var(--text-muted)] mb-6">Join thousands of students making smarter college decisions with EduPath.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth/register" className="btn-primary px-8 py-3">Get Started — Free</Link>
              <Link href="/colleges" className="btn-ghost px-8 py-3">Browse Colleges</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] px-4 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">E</div>
            <span className="font-bold gradient-text">EduPath</span>
          </div>
          <p className="text-xs text-[var(--text-dim)]">© 2024 EduPath. College Discovery Platform. Built for Track B.</p>
          <div className="flex items-center gap-4 text-xs text-[var(--text-dim)]">
            <Link href="/colleges" className="hover:text-indigo-400 transition-colors">Colleges</Link>
            <Link href="/compare" className="hover:text-indigo-400 transition-colors">Compare</Link>
            <Link href="/discuss" className="hover:text-indigo-400 transition-colors">Discuss</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
