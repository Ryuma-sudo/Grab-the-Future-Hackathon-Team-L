'use client';

import React, { useState } from 'react';
import { Search, Bell, User, ChevronDown, LogOut, X } from 'lucide-react';
import { useAuth } from '@/lib/auth';

type AuthMode = 'login' | 'register';

export default function MapTopBar() {
  const [searchFocused, setSearchFocused] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <>
      <div className="absolute top-0 left-0 right-0 z-30 px-4 pt-12 pb-3 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
        {/* Search bar */}
        <div
          className={`flex-1 flex items-center gap-2 bg-card rounded-2xl px-4 py-3 shadow-card-lg transition-all duration-200 ${
            searchFocused ? 'ring-2 ring-primary/30' : ''
          }`}
        >
          <Search size={16} className="text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Tìm địa điểm, trạm xe..."
            className="flex-1 bg-transparent text-sm font-medium placeholder:text-muted-foreground outline-none"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <div className="flex items-center gap-1 text-muted-foreground border-l border-border pl-2">
            <span className="text-xs font-medium">Gần tôi</span>
            <ChevronDown size={12} />
          </div>
        </div>

        {/* Notification */}
        <button className="relative bg-card rounded-2xl p-3 shadow-card-lg active:scale-95 transition-all duration-150">
          <Bell size={18} className="text-foreground" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full" />
        </button>

        {/* User */}
          {user ? (
            <button
              onClick={logout}
              className="bg-card rounded-2xl px-3 py-2.5 shadow-card-lg active:scale-95 transition-all duration-150 flex items-center gap-2"
              title="Logout"
            >
              <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                <User size={14} className="text-primary" />
              </div>
              <span className="hidden min-[430px]:block text-xs font-bold text-foreground max-w-20 truncate">
                {user.full_name}
              </span>
              <LogOut size={15} className="text-muted-foreground" />
            </button>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className="bg-card rounded-2xl p-3 shadow-card-lg active:scale-95 transition-all duration-150"
              title="Login"
            >
              <User size={18} className="text-foreground" />
            </button>
          )}
        </div>
      </div>
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </>
  );
}

function AuthModal({ onClose }: { onClose: () => void }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await login({ email, password });
      } else {
        await register({
          full_name: fullName,
          email,
          phone: phone || null,
          password,
        });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-card rounded-t-3xl shadow-bottom-sheet border border-border p-5 fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-foreground">
              {mode === 'login' ? 'Login' : 'Create account'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Connect this device with the backend user API.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-muted active:scale-95 transition-all duration-150"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-2xl mb-4">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'login' ? 'bg-card text-foreground shadow-card' : 'text-muted-foreground'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'register' ? 'bg-card text-foreground shadow-card' : 'text-muted-foreground'
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
              minLength={2}
              placeholder="Full name"
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/30"
            />
          )}
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            placeholder="Email"
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/30"
          />
          {mode === 'register' && (
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Phone (optional)"
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/30"
            />
          )}
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
            type="password"
            placeholder="Password"
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/30"
          />

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-danger">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-primary text-white rounded-2xl text-sm font-bold active:scale-[0.98] transition-all duration-150 disabled:opacity-70"
          >
            {submitting ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
