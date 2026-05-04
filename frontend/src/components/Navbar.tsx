'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/colleges', label: 'Colleges' },
    { href: '/compare', label: 'Compare' },
    { href: '/predictor', label: '🎯 Predictor' },
    { href: '/discuss', label: 'Discuss' },
  ];

  function handleLogout() {
    logout();
    router.push('/');
  }

  return (
    <nav className="glass sticky top-0 z-50 border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">E</div>
            <span className="font-bold text-lg gradient-text">EduPath</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === link.href
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/saved" className="btn-ghost text-sm">
                  ❤️ Saved
                </Link>
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                      {user.name[0].toUpperCase()}
                    </div>
                    <span className="text-sm text-[var(--text-muted)]">{user.name.split(' ')[0]}</span>
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-44 glass rounded-xl shadow-xl border border-[var(--border)] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200">
                    <Link
                      href="/profile"
                      className="block px-4 py-2.5 text-sm text-[var(--text-muted)] hover:text-indigo-400 hover:bg-white/5 rounded-t-xl transition-colors"
                    >
                      👤 My Profile
                    </Link>
                    <Link
                      href="/saved"
                      className="block px-4 py-2.5 text-sm text-[var(--text-muted)] hover:text-indigo-400 hover:bg-white/5 transition-colors"
                    >
                      ❤️ Saved Colleges
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-white/5 rounded-b-xl transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className="btn-ghost text-sm">Sign in</Link>
                <Link href="/auth/register" className="btn-primary text-sm">Sign up</Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[var(--text-muted)]">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-[var(--border)] space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  pathname === link.href ? 'text-indigo-400 bg-indigo-500/10' : 'text-[var(--text-muted)]'
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-[var(--border)] pt-2 mt-2">
              {user ? (
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2.5 text-sm text-[var(--danger)]">
                  Sign out
                </button>
              ) : (
                <>
                  <Link href="/auth/login" className="block px-4 py-2.5 text-sm text-[var(--text-muted)]" onClick={() => setMenuOpen(false)}>Sign in</Link>
                  <Link href="/auth/register" className="block px-4 py-2.5 text-sm text-indigo-400" onClick={() => setMenuOpen(false)}>Sign up</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
