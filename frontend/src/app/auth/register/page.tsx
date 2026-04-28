'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Registration failed'); return; }
      login(data.token, data.user);
      router.push('/colleges');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="glass rounded-2xl p-8 border border-[var(--border)]">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">E</div>
            <h1 className="text-2xl font-bold text-[var(--text)]">Join EduPath</h1>
            <p className="text-[var(--text-muted)] text-sm mt-1">Create your account to save and compare colleges</p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">Full Name</label>
              <input id="name" type="text" required placeholder="John Doe" className="input-field"
                value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">Email address</label>
              <input id="reg-email" type="email" required placeholder="you@example.com" className="input-field"
                value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">Password</label>
              <input id="reg-password" type="password" required placeholder="At least 6 characters" className="input-field"
                value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">Confirm Password</label>
              <input id="confirm-password" type="password" required placeholder="Repeat password" className="input-field"
                value={form.confirm} onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))} />
            </div>
            <button id="register-btn" type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create Account →'}
            </button>
          </form>

          <p className="text-center text-sm text-[var(--text-muted)] mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
