'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { College } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useCompare } from '@/context/CompareContext';

const API = process.env.NEXT_PUBLIC_API_URL;

function StatBox({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card text-center">
      <div className="text-2xl font-bold gradient-text">{value}</div>
      <div className="text-xs text-[var(--text-muted)] mt-1">{label}</div>
      {sub && <div className="text-xs text-[var(--text-dim)] mt-0.5">{sub}</div>}
    </div>
  );
}

export default function CollegeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, savedIds, toggleSave } = useAuth();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const [college, setCollege] = useState<College | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'placements' | 'facilities'>('overview');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API}/api/colleges/${id}`)
      .then((r) => { if (!r.ok) throw new Error('Not found'); return r.json(); })
      .then((d) => setCollege(d.college))
      .catch(() => setError('College not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 flex justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (error || !college) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-[var(--text)] mb-2">College Not Found</h2>
        <p className="text-[var(--text-muted)] mb-6">The college you are looking for doesn&apos;t exist.</p>
        <Link href="/colleges" className="btn-primary">← Back to Colleges</Link>
      </div>
    );
  }

  const isSaved = savedIds.includes(college.id);
  const inCompare = isInCompare(college.id);

  const courses = Array.isArray(college.courses) ? college.courses : [];
  const facilities = Array.isArray(college.facilities) ? college.facilities : [];

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'courses', label: `Courses (${courses.length})` },
    { key: 'placements', label: 'Placements' },
    { key: 'facilities', label: 'Facilities' },
  ] as const;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-6">
        <Link href="/" className="hover:text-indigo-400 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/colleges" className="hover:text-indigo-400 transition-colors">Colleges</Link>
        <span>/</span>
        <span className="text-[var(--text)] truncate max-w-[200px]">{college.name}</span>
      </nav>

      {/* Hero */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Logo */}
          <div className="w-full md:w-36 h-36 rounded-xl overflow-hidden bg-[var(--bg-card2)] flex items-center justify-center flex-shrink-0">
            {college.image_url ? (
              <div className="relative w-full h-full">
                <Image src={college.image_url} alt={college.name} fill className="object-contain p-3" />
              </div>
            ) : (
              <span className="text-5xl">🎓</span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-start gap-2 mb-2">
              {college.ranking && (
                <span className="badge" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
                  Rank #{college.ranking}
                </span>
              )}
              <span className={`badge ${college.type === 'Government' ? 'badge-gov' : 'badge-priv'}`}>
                {college.type}
              </span>
              {college.accreditation && (
                <span className="badge badge-priv">{college.accreditation}</span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)] mb-2">{college.name}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-muted)] mb-3">
              <span className="flex items-center gap-1.5">
                📍 {college.location}
              </span>
              {college.established && (
                <span className="flex items-center gap-1.5">
                  📅 Est. {college.established}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                ⭐ {college.rating.toFixed(1)} ({college.rating_count?.toLocaleString()} reviews)
              </span>
            </div>

            {college.description && (
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">{college.description}</p>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mt-4">
              <button
                onClick={async () => {
                  if (!user) { router.push('/auth/login'); return; }
                  await toggleSave(college.id);
                }}
                className={`btn-ghost text-sm ${isSaved ? 'text-red-400 border-red-500/30' : ''}`}
              >
                {isSaved ? '❤️ Saved' : '🤍 Save'}
              </button>
              <button
                onClick={() => inCompare ? removeFromCompare(college.id) : addToCompare(college.id)}
                className={`btn-ghost text-sm ${inCompare ? 'text-indigo-400 border-indigo-500/30' : ''}`}
              >
                {inCompare ? '✓ In Compare' : '⚖️ Compare'}
              </button>
              {college.website && (
                <a href={college.website} target="_blank" rel="noopener noreferrer" className="btn-outline text-sm">
                  🌐 Website ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatBox
          label="Annual Fees"
          value={`₹${(college.fees_min / 100000).toFixed(1)}L`}
          sub={`Up to ₹${(college.fees_max / 100000).toFixed(1)}L`}
        />
        <StatBox
          label="Placement Rate"
          value={college.placement_percentage ? `${college.placement_percentage}%` : 'N/A'}
        />
        <StatBox
          label="Avg Package"
          value={college.avg_package ? `₹${(college.avg_package / 100000).toFixed(1)}L` : 'N/A'}
          sub={college.highest_package ? `Highest: ₹${(college.highest_package / 100000).toFixed(0)}L` : undefined}
        />
        <StatBox
          label="Total Students"
          value={college.total_students ? college.total_students.toLocaleString() : 'N/A'}
        />
      </div>

      {/* Tabs */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex border-b border-[var(--border)] overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              id={`tab-${tab.key}`}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/3'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6 fade-in">
              <div>
                <h2 className="text-lg font-semibold text-[var(--text)] mb-3">About {college.name}</h2>
                <p className="text-[var(--text-muted)] leading-relaxed">
                  {college.description || 'No description available.'}
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Location', value: college.location },
                  { label: 'State', value: college.state },
                  { label: 'Type', value: college.type },
                  { label: 'Established', value: college.established?.toString() || 'N/A' },
                  { label: 'Accreditation', value: college.accreditation || 'N/A' },
                  { label: 'NIRF Ranking', value: college.ranking ? `#${college.ranking}` : 'N/A' },
                ].map((item) => (
                  <div key={item.label} className="bg-[var(--bg-card2)] rounded-xl p-3">
                    <div className="text-xs text-[var(--text-dim)] mb-1">{item.label}</div>
                    <div className="text-sm font-medium text-[var(--text)]">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <div className="fade-in">
              <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Courses Offered</h2>
              {courses.length === 0 ? (
                <p className="text-[var(--text-muted)]">Course information not available.</p>
              ) : (
                <div className="space-y-3">
                  {courses.map((course, i) => (
                    <div key={i} className="flex items-center justify-between bg-[var(--bg-card2)] rounded-xl px-4 py-3">
                      <div>
                        <div className="font-medium text-[var(--text)] text-sm">{course.name}</div>
                        <div className="text-xs text-[var(--text-muted)] mt-0.5">⏱ {course.duration}</div>
                      </div>
                      <div className="text-sm font-semibold text-indigo-400">
                        ₹{(course.fees / 100000).toFixed(1)}L/yr
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Placements Tab */}
          {activeTab === 'placements' && (
            <div className="fade-in space-y-4">
              <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Placement Statistics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card text-center">
                  <div className="text-3xl font-bold text-[var(--success)]">
                    {college.placement_percentage ? `${college.placement_percentage}%` : 'N/A'}
                  </div>
                  <div className="text-sm text-[var(--text-muted)] mt-1">Placement Rate</div>
                </div>
                <div className="card text-center">
                  <div className="text-3xl font-bold text-indigo-400">
                    {college.avg_package ? `₹${(college.avg_package / 100000).toFixed(1)}L` : 'N/A'}
                  </div>
                  <div className="text-sm text-[var(--text-muted)] mt-1">Average Package</div>
                </div>
                <div className="card text-center">
                  <div className="text-3xl font-bold text-amber-400">
                    {college.highest_package ? `₹${(college.highest_package / 100000).toFixed(0)}L` : 'N/A'}
                  </div>
                  <div className="text-sm text-[var(--text-muted)] mt-1">Highest Package</div>
                </div>
              </div>
              <div className="bg-[var(--bg-card2)] rounded-xl p-4">
                <p className="text-sm text-[var(--text-muted)]">
                  Top recruiters include major MNCs, product companies, and core sector firms. 
                  The placement cell conducts drives throughout the academic year.
                </p>
              </div>
            </div>
          )}

          {/* Facilities Tab */}
          {activeTab === 'facilities' && (
            <div className="fade-in">
              <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Campus Facilities</h2>
              {facilities.length === 0 ? (
                <p className="text-[var(--text-muted)]">Facility information not available.</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {facilities.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 bg-[var(--bg-card2)] border border-[var(--border)] rounded-xl px-4 py-2.5">
                      <span className="text-indigo-400">✓</span>
                      <span className="text-sm text-[var(--text)]">{f}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
