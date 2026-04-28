'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { College } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useCompare } from '@/context/CompareContext';

const API = process.env.NEXT_PUBLIC_API_URL;

const COMPARE_FIELDS: { key: keyof College; label: string; format?: (v: unknown) => string }[] = [
  { key: 'type', label: 'Type' },
  { key: 'state', label: 'State' },
  { key: 'established', label: 'Established' },
  { key: 'accreditation', label: 'Accreditation' },
  { key: 'ranking', label: 'NIRF Ranking', format: (v) => v ? `#${v}` : 'N/A' },
  { key: 'rating', label: 'Rating', format: (v) => v ? `${Number(v).toFixed(1)} ⭐` : 'N/A' },
  { key: 'fees_min', label: 'Min. Fees', format: (v) => v ? `₹${(Number(v) / 100000).toFixed(1)}L/yr` : 'N/A' },
  { key: 'fees_max', label: 'Max. Fees', format: (v) => v ? `₹${(Number(v) / 100000).toFixed(1)}L/yr` : 'N/A' },
  { key: 'placement_percentage', label: 'Placement %', format: (v) => v ? `${v}%` : 'N/A' },
  { key: 'avg_package', label: 'Avg Package', format: (v) => v ? `₹${(Number(v) / 100000).toFixed(1)}L` : 'N/A' },
  { key: 'highest_package', label: 'Highest Package', format: (v) => v ? `₹${(Number(v) / 100000).toFixed(0)}L` : 'N/A' },
  { key: 'total_students', label: 'Total Students', format: (v) => v ? Number(v).toLocaleString() : 'N/A' },
];

function getBest(colleges: College[], key: keyof College): string | null {
  const numericKeys: (keyof College)[] = ['rating', 'placement_percentage', 'avg_package', 'highest_package'];
  const reverseKeys: (keyof College)[] = ['fees_min', 'fees_max', 'ranking'];
  if (numericKeys.includes(key)) {
    const vals = colleges.map((c) => Number(c[key] ?? 0));
    const max = Math.max(...vals);
    return colleges.find((c) => Number(c[key] ?? 0) === max)?.id ?? null;
  }
  if (reverseKeys.includes(key)) {
    const vals = colleges.map((c) => Number(c[key] ?? Infinity));
    const min = Math.min(...vals);
    return colleges.find((c) => Number(c[key] ?? Infinity) === min)?.id ?? null;
  }
  return null;
}

function CompareContent() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get('ids');
  const { clearCompare } = useCompare();
  const { user, token } = useAuth();
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!idsParam) return;
    setLoading(true);
    fetch(`${API}/api/colleges/compare?ids=${idsParam}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.colleges) setColleges(d.colleges);
        else setError('Failed to load colleges');
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false));
  }, [idsParam]);

  const handleSaveComparison = async () => {
    if (!user || !token) return;
    const ids = idsParam?.split(',') ?? [];
    try {
      const res = await fetch(`${API}/api/user/comparisons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ college_ids: ids, name: `Compare: ${colleges.map((c) => c.name.split(' ').slice(0,2).join(' ')).join(' vs ')}` }),
      });
      if (res.ok) setSaved(true);
    } catch {}
  };

  if (!idsParam) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">⚖️</div>
        <h1 className="text-3xl font-bold text-[var(--text)] mb-3">Compare Colleges</h1>
        <p className="text-[var(--text-muted)] mb-8 max-w-md mx-auto">
          Select 2–3 colleges from the listing page and click &quot;Compare Now&quot; to see a side-by-side comparison.
        </p>
        <Link href="/colleges" className="btn-primary">Browse Colleges →</Link>
      </div>
    );
  }

  if (loading) return <div className="flex justify-center py-20"><div className="spinner" /></div>;

  if (error) return (
    <div className="max-w-5xl mx-auto px-4 py-16 text-center">
      <p className="text-[var(--danger)]">{error}</p>
      <Link href="/colleges" className="btn-primary mt-4">Go Back</Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 fade-in">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="section-title">College Comparison</h1>
          <p className="text-[var(--text-muted)] text-sm">Side-by-side comparison of {colleges.length} colleges</p>
        </div>
        <div className="flex gap-2">
          {user && !saved && (
            <button onClick={handleSaveComparison} className="btn-outline text-sm">
              💾 Save Comparison
            </button>
          )}
          {saved && <span className="text-[var(--success)] text-sm font-medium px-3 py-2">✓ Saved!</span>}
          <Link href="/colleges" onClick={clearCompare} className="btn-ghost text-sm">
            ← New Compare
          </Link>
        </div>
      </div>

      {/* College headers */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr>
              <th className="text-left text-sm text-[var(--text-muted)] font-medium py-3 px-4 w-36 bg-[var(--bg-card)] rounded-tl-xl border border-[var(--border)] border-r-0">
                Criteria
              </th>
              {colleges.map((c, i) => (
                <th key={c.id} className={`py-3 px-4 bg-[var(--bg-card)] border border-[var(--border)] ${i === colleges.length - 1 ? 'rounded-tr-xl' : 'border-r-0'}`}>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-[var(--bg-card2)] flex items-center justify-center">
                      {c.image_url ? (
                        <div className="relative w-full h-full">
                          <Image src={c.image_url} alt={c.name} fill className="object-contain p-1" />
                        </div>
                      ) : <span className="text-2xl">🎓</span>}
                    </div>
                    <Link href={`/colleges/${c.id}`} className="text-sm font-semibold text-[var(--text)] hover:text-indigo-400 transition-colors text-center leading-snug">
                      {c.name}
                    </Link>
                    <span className="text-xs text-[var(--text-dim)]">{c.location}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARE_FIELDS.map((field, fi) => {
              const bestId = getBest(colleges, field.key);
              return (
                <tr key={field.key} className={fi % 2 === 0 ? 'bg-[var(--bg-card2)]' : 'bg-[var(--bg-card)]'}>
                  <td className="py-3 px-4 text-sm font-medium text-[var(--text-muted)] border border-[var(--border)] border-t-0 border-r-0">
                    {field.label}
                  </td>
                  {colleges.map((c, ci) => {
                    const rawVal = c[field.key];
                    const displayVal = field.format ? field.format(rawVal) : (rawVal != null ? String(rawVal) : 'N/A');
                    const isBest = bestId === c.id;
                    return (
                      <td
                        key={c.id}
                        className={`py-3 px-4 text-sm text-center border border-[var(--border)] border-t-0 ${ci === colleges.length - 1 ? '' : 'border-r-0'} ${isBest ? 'text-[var(--success)] font-semibold' : 'text-[var(--text)]'}`}
                      >
                        {isBest ? `✓ ${displayVal}` : displayVal}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Quick action */}
      <div className="mt-6 flex flex-wrap gap-3">
        {colleges.map((c) => (
          <Link key={c.id} href={`/colleges/${c.id}`} className="btn-outline text-sm">
            View {c.name.split(' ').slice(0, 3).join(' ')} →
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="spinner" /></div>}>
      <CompareContent />
    </Suspense>
  );
}
