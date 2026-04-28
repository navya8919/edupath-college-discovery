'use client';
import Link from 'next/link';
import Image from 'next/image';
import { College } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useCompare } from '@/context/CompareContext';
import { useRouter } from 'next/navigation';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
          className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? 'text-amber-400' : 'text-[var(--border)]'}`}>
          <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
        </svg>
      ))}
      <span className="text-xs text-[var(--text-muted)] ml-0.5">{rating.toFixed(1)}</span>
    </div>
  );
}

interface Props {
  college: College;
}

export default function CollegeCard({ college }: Props) {
  const { user, savedIds, toggleSave } = useAuth();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const router = useRouter();
  const isSaved = savedIds.includes(college.id);
  const inCompare = isInCompare(college.id);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { router.push('/auth/login'); return; }
    await toggleSave(college.id);
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inCompare) removeFromCompare(college.id);
    else addToCompare(college.id);
  };

  return (
    <div className="card glass-hover fade-in flex flex-col h-full relative overflow-hidden">
      {/* Ranking badge */}
      {college.ranking && (
        <div className="absolute top-3 left-3 z-10">
          <span className="badge" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
            #{college.ranking}
          </span>
        </div>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
        style={{
          background: isSaved ? 'rgba(239,68,68,0.2)' : 'rgba(0,0,0,0.4)',
          color: isSaved ? '#ef4444' : 'var(--text-muted)',
          border: `1px solid ${isSaved ? 'rgba(239,68,68,0.4)' : 'var(--border)'}`,
        }}
        title={isSaved ? 'Unsave' : 'Save college'}
      >
        {isSaved ? '❤️' : '🤍'}
      </button>

      {/* College image */}
      <div className="relative w-full h-36 rounded-xl overflow-hidden mb-4 bg-[var(--bg-card2)] flex items-center justify-center">
        {college.image_url ? (
          <Image
            src={college.image_url}
            alt={college.name}
            fill
            className="object-contain p-4"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="text-4xl">🎓</div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 gap-2">
        <div className="flex items-start gap-2">
          <span className={`badge flex-shrink-0 mt-0.5 ${college.type === 'Government' ? 'badge-gov' : 'badge-priv'}`}>
            {college.type}
          </span>
          {college.accreditation && (
            <span className="badge" style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)' }}>
              {college.accreditation}
            </span>
          )}
        </div>

        <h3 className="font-semibold text-[var(--text)] text-base leading-snug line-clamp-2 group-hover:text-indigo-400 transition-colors">
          {college.name}
        </h3>

        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0">
            <path fillRule="evenodd" d="m7.539 14.841.003.003.002.002a.755.755 0 0 0 .912 0l.002-.002.003-.003.012-.009a5.57 5.57 0 0 0 .19-.153 15.588 15.588 0 0 0 2.046-2.082c1.101-1.362 2.291-3.342 2.291-5.597A5 5 0 0 0 3 7c0 2.255 1.19 4.235 2.292 5.597a15.591 15.591 0 0 0 2.046 2.082 8.916 8.916 0 0 0 .19.153l.012.01ZM8 8.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" clipRule="evenodd" />
          </svg>
          <span className="truncate">{college.location}</span>
        </div>

        <StarRating rating={college.rating} />

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2 mt-1">
          <div className="bg-[var(--bg-card2)] rounded-lg p-2 text-center">
            <div className="text-xs text-[var(--text-dim)]">Fees</div>
            <div className="text-sm font-semibold text-[var(--text)]">
              ₹{(college.fees_min / 100000).toFixed(1)}–{(college.fees_max / 100000).toFixed(1)}L
            </div>
          </div>
          <div className="bg-[var(--bg-card2)] rounded-lg p-2 text-center">
            <div className="text-xs text-[var(--text-dim)]">Placement</div>
            <div className="text-sm font-semibold text-[var(--success)]">
              {college.placement_percentage ? `${college.placement_percentage}%` : 'N/A'}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-2">
          <Link
            href={`/colleges/${college.id}`}
            className="btn-primary text-xs flex-1 justify-center py-2"
          >
            View Details
          </Link>
          <button
            onClick={handleCompare}
            className={`text-xs px-3 py-2 rounded-lg border transition-all duration-200 font-medium ${
              inCompare
                ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400'
                : 'bg-transparent border-[var(--border)] text-[var(--text-muted)] hover:border-indigo-500/40 hover:text-indigo-400'
            }`}
            title={inCompare ? 'Remove from compare' : 'Add to compare'}
          >
            {inCompare ? '✓ Added' : '+ Compare'}
          </button>
        </div>
      </div>
    </div>
  );
}
