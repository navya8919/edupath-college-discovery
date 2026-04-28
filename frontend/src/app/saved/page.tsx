'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { College } from '@/types';
import { useAuth } from '@/context/AuthContext';
import CollegeCard from '@/components/CollegeCard';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function SavedPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/auth/login'); return; }
    if (!token) return;
    fetch(`${API}/api/user/saved`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setSaved(d.saved || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, token, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-1">Saved Colleges</h1>
        <p className="text-[var(--text-muted)]">
          {saved.length === 0 ? "You haven't saved any colleges yet" : `${saved.length} college${saved.length !== 1 ? 's' : ''} saved`}
        </p>
      </div>

      {saved.length === 0 ? (
        <div className="text-center py-20 card">
          <div className="text-6xl mb-4">🤍</div>
          <h3 className="text-xl font-semibold text-[var(--text)] mb-2">No saved colleges</h3>
          <p className="text-[var(--text-muted)] mb-6">Browse colleges and click the heart icon to save them here.</p>
          <Link href="/colleges" className="btn-primary">Browse Colleges →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {saved.map((c) => <CollegeCard key={c.id} college={c} />)}
        </div>
      )}
    </div>
  );
}
