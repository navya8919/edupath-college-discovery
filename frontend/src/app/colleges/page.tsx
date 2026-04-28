'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import CollegeCard from '@/components/CollegeCard';
import { College, CollegesResponse } from '@/types';

const API = process.env.NEXT_PUBLIC_API_URL;

interface Filters {
  search: string;
  state: string;
  type: string;
  fees_max: string;
  sort: string;
}

function SkeletonCard() {
  return (
    <div className="card">
      <div className="skeleton h-36 w-full rounded-xl mb-4" />
      <div className="skeleton h-4 w-20 rounded mb-2" />
      <div className="skeleton h-5 w-full rounded mb-2" />
      <div className="skeleton h-4 w-32 rounded mb-3" />
      <div className="grid grid-cols-2 gap-2">
        <div className="skeleton h-14 rounded-lg" />
        <div className="skeleton h-14 rounded-lg" />
      </div>
    </div>
  );
}

export default function CollegesPage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [states, setStates] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>({
    search: '', state: '', type: '', fees_max: '10000000', sort: 'ranking',
  });
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch states for filter
  useEffect(() => {
    fetch(`${API}/api/colleges/states`)
      .then((r) => r.json())
      .then((d) => setStates(d.states || []))
      .catch(() => {});
  }, []);

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(filters.search);
      setPage(1);
    }, 400);
  }, [filters.search]);

  const fetchColleges = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      search: debouncedSearch,
      state: filters.state,
      type: filters.type,
      fees_max: filters.fees_max,
      sort: filters.sort,
      page: page.toString(),
      limit: '12',
    });
    try {
      const res = await fetch(`${API}/api/colleges?${params}`);
      const data: CollegesResponse = await res.json();
      setColleges(data.colleges || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters.state, filters.type, filters.fees_max, filters.sort, page]);

  useEffect(() => { fetchColleges(); }, [fetchColleges]);

  const handleFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    if (key !== 'search') setPage(1);
  };

  const feeOptions = [
    { label: 'Any', value: '10000000' },
    { label: 'Under ₹1L', value: '100000' },
    { label: 'Under ₹2L', value: '200000' },
    { label: 'Under ₹5L', value: '500000' },
    { label: 'Under ₹10L', value: '1000000' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-1">Find Your College</h1>
        <p className="text-[var(--text-muted)]">
          Explore {total > 0 ? total : '...'} top colleges across India
        </p>
      </div>

      {/* Search + Filters */}
      <div className="glass rounded-2xl p-4 mb-8 space-y-4">
        {/* Search */}
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--text-dim)] pointer-events-none w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            id="search-input"
            type="text"
            placeholder="Search colleges, cities, states..."
            className="input-field pl-10"
            value={filters.search}
            onChange={(e) => handleFilter('search', e.target.value)}
          />
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap gap-3">
          <select
            id="state-filter"
            className="input-field w-auto text-sm"
            value={filters.state}
            onChange={(e) => handleFilter('state', e.target.value)}
          >
            <option value="">All States</option>
            {states.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            id="type-filter"
            className="input-field w-auto text-sm"
            value={filters.type}
            onChange={(e) => handleFilter('type', e.target.value)}
          >
            <option value="">All Types</option>
            <option value="Government">Government</option>
            <option value="Private">Private</option>
          </select>

          <select
            id="fees-filter"
            className="input-field w-auto text-sm"
            value={filters.fees_max}
            onChange={(e) => handleFilter('fees_max', e.target.value)}
          >
            {feeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <select
            id="sort-filter"
            className="input-field w-auto text-sm"
            value={filters.sort}
            onChange={(e) => handleFilter('sort', e.target.value)}
          >
            <option value="ranking">Sort: Ranking</option>
            <option value="rating">Sort: Rating</option>
            <option value="fees_min">Sort: Fees (Low)</option>
            <option value="placement_percentage">Sort: Placement %</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : colleges.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-[var(--text)] mb-2">No colleges found</h3>
          <p className="text-[var(--text-muted)]">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-[var(--text-muted)]">
              Showing <span className="text-[var(--text)] font-medium">{colleges.length}</span> of <span className="text-[var(--text)] font-medium">{total}</span> colleges
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {colleges.map((c) => <CollegeCard key={c.id} college={c} />)}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="btn-ghost disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                      page === p
                        ? 'bg-indigo-500 text-white'
                        : 'text-[var(--text-muted)] hover:bg-white/5'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="btn-ghost disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
