'use client';
import { useCompare } from '@/context/CompareContext';
import { useRouter } from 'next/navigation';

export default function CompareBar() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const router = useRouter();

  if (compareList.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-[var(--border)] shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-semibold text-[var(--text-muted)]">
            Compare ({compareList.length}/3):
          </span>
          {compareList.map((id, i) => (
            <div key={id} className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-lg px-3 py-1.5">
              <span className="text-indigo-400 text-xs font-medium">College {i + 1}</span>
              <button
                onClick={() => removeFromCompare(id)}
                className="text-[var(--text-dim)] hover:text-[var(--danger)] transition-colors ml-1"
              >
                ✕
              </button>
            </div>
          ))}
          {compareList.length < 3 && (
            <span className="text-xs text-[var(--text-dim)] italic">Add {3 - compareList.length} more</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={clearCompare} className="btn-ghost text-sm">Clear</button>
          <button
            onClick={() => router.push(`/compare?ids=${compareList.join(',')}`)}
            disabled={compareList.length < 2}
            className="btn-primary text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Compare Now →
          </button>
        </div>
      </div>
    </div>
  );
}
