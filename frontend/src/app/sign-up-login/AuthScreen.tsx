'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Zap, Copy, Check, ArrowRight, Loader2 } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';

type LoginForm = {
  email: string;
  password: string;
  rememberMe: boolean;
};

type SignUpForm = {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  agreeTerms: boolean;
};

const DEMO_EMAIL = 'alex.morgan@evride.app';
const DEMO_PASSWORD = 'Ride2026!';

type AuthScreenProps = {
  onAuthenticated?: () => void;
};

export default function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const loginForm = useForm<LoginForm>({
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const signupForm = useForm<SignUpForm>({
    defaultValues: { fullName: '', phone: '', email: '', password: '', agreeTerms: false },
  });

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleLoginSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    // Backend: POST /api/auth/login { email: data.email, password: data.password }
    await new Promise((r) => setTimeout(r, 1200));
    setIsLoading(false);
    if (data.email !== DEMO_EMAIL || data.password !== DEMO_PASSWORD) {
      loginForm.setError('email', {
        message: 'Invalid credentials — use the demo account below to sign in',
      });
      return;
    }
    onAuthenticated?.();
  };

  const handleSignupSubmit = async (_data: SignUpForm) => {
    setIsLoading(true);
    // Backend: POST /api/auth/register { fullName, phone, email, password }
    await new Promise((r) => setTimeout(r, 1200));
    setIsLoading(false);
    onAuthenticated?.();
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    // Backend: initiate Google OAuth flow
    await new Promise((r) => setTimeout(r, 900));
    setIsLoading(false);
    onAuthenticated?.();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-secondary via-background to-white px-4 py-8">
      {/* Background decorative blobs */}
      <div
        className="fixed top-0 right-0 w-64 h-64 rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)', filter: 'blur(60px)' }}
      />
      <div
        className="fixed bottom-0 left-0 w-48 h-48 rounded-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)', filter: 'blur(50px)' }}
      />

      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <AppLogo size={40} />
        <span className="font-sans text-2xl font-700 text-foreground tracking-tight font-semibold">
          EVRide
        </span>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-card rounded-2xl shadow-xl border border-border overflow-hidden fade-in-up">
        {/* Tab switcher */}
        <div className="flex bg-muted p-1 m-4 rounded-xl">
          {(['login', 'signup'] as const).map((t) => (
            <button
              key={`tab-${t}`}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                tab === t
                  ? 'bg-card text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'login' ? 'Log In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <div className="px-6 pb-6">
          {/* Value prop */}
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <Zap size={14} className="text-primary-foreground fill-current" />
            </div>
            <p className="text-xs text-muted-foreground">
              {tab === 'login' ? 'Welcome back — your rides await' : 'Start riding in under 2 minutes'}
            </p>
          </div>

          {/* Google Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 border border-border rounded-xl py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-all duration-150 active:scale-95 mb-4 disabled:opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* LOGIN FORM */}
          {tab === 'login' && (
            <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-foreground mb-1.5">
                  Email address
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-150 ${
                    loginForm.formState.errors.email ? 'border-red-400' : 'border-border'
                  }`}
                  {...loginForm.register('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
                  })}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-xs text-red-500 mt-1">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-foreground mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className={`w-full px-3.5 py-2.5 pr-10 rounded-xl border text-sm bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-150 ${
                      loginForm.formState.errors.password ? 'border-red-400' : 'border-border'
                    }`}
                    {...loginForm.register('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Minimum 6 characters' },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-xs text-red-500 mt-1">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-border text-primary focus:ring-ring accent-primary"
                    {...loginForm.register('rememberMe')}
                  />
                  <span className="text-xs text-muted-foreground">Remember me</span>
                </label>
                <button type="button" className="text-xs text-primary font-medium hover:underline">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3 text-sm font-semibold hover:opacity-90 active:scale-95 transition-all duration-150 disabled:opacity-70"
                style={{ minHeight: '44px' }}
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    Log In <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* SIGNUP FORM */}
          {tab === 'signup' && (
            <form onSubmit={signupForm.handleSubmit(handleSignupSubmit)} className="space-y-4">
              <div>
                <label htmlFor="signup-name" className="block text-sm font-medium text-foreground mb-1.5">
                  Full name
                </label>
                <input
                  id="signup-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Alex Morgan"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-150 ${
                    signupForm.formState.errors.fullName ? 'border-red-400' : 'border-border'
                  }`}
                  {...signupForm.register('fullName', { required: 'Full name is required' })}
                />
                {signupForm.formState.errors.fullName && (
                  <p className="text-xs text-red-500 mt-1">{signupForm.formState.errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="signup-phone" className="block text-sm font-medium text-foreground mb-1.5">
                  Phone number
                </label>
                <input
                  id="signup-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+1 (555) 000-0000"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-150 ${
                    signupForm.formState.errors.phone ? 'border-red-400' : 'border-border'
                  }`}
                  {...signupForm.register('phone', { required: 'Phone number is required' })}
                />
                {signupForm.formState.errors.phone && (
                  <p className="text-xs text-red-500 mt-1">{signupForm.formState.errors.phone.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium text-foreground mb-1.5">
                  Email address
                </label>
                <input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-150 ${
                    signupForm.formState.errors.email ? 'border-red-400' : 'border-border'
                  }`}
                  {...signupForm.register('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
                  })}
                />
                {signupForm.formState.errors.email && (
                  <p className="text-xs text-red-500 mt-1">{signupForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-foreground mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Min. 8 characters"
                    className={`w-full px-3.5 py-2.5 pr-10 rounded-xl border text-sm bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-150 ${
                      signupForm.formState.errors.password ? 'border-red-400' : 'border-border'
                    }`}
                    {...signupForm.register('password', {
                      required: 'Password is required',
                      minLength: { value: 8, message: 'Minimum 8 characters' },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {signupForm.formState.errors.password && (
                  <p className="text-xs text-red-500 mt-1">{signupForm.formState.errors.password.message}</p>
                )}
              </div>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border mt-0.5 accent-primary"
                  {...signupForm.register('agreeTerms', { required: 'You must agree to continue' })}
                />
                <span className="text-xs text-muted-foreground leading-relaxed">
                  I agree to the{' '}
                  <button type="button" className="text-primary font-medium hover:underline">Terms of Service</button>
                  {' '}and{' '}
                  <button type="button" className="text-primary font-medium hover:underline">Privacy Policy</button>
                </span>
              </label>
              {signupForm.formState.errors.agreeTerms && (
                <p className="text-xs text-red-500">{signupForm.formState.errors.agreeTerms.message}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3 text-sm font-semibold hover:opacity-90 active:scale-95 transition-all duration-150 disabled:opacity-70"
                style={{ minHeight: '44px' }}
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    Create Account <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Demo credentials */}
          <div className="mt-5 rounded-xl border border-border bg-secondary p-3.5">
            <p className="text-xs font-semibold text-secondary-foreground mb-2 flex items-center gap-1.5">
              <Zap size={12} className="text-primary" />
              Demo credentials
            </p>
            <div className="space-y-1.5">
              {[
                { label: 'Email', value: DEMO_EMAIL, key: 'email' },
                { label: 'Password', value: DEMO_PASSWORD, key: 'password' },
              ].map((item) => (
                <div key={`cred-${item.key}`} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground w-14">{item.label}</span>
                  <span className="text-xs font-mono text-foreground flex-1 truncate">{item.value}</span>
                  <button
                    type="button"
                    onClick={() => {
                      handleCopy(item.value, item.key);
                      if (tab === 'login') {
                        if (item.key === 'email') loginForm.setValue('email', item.value);
                        if (item.key === 'password') loginForm.setValue('password', item.value);
                      }
                    }}
                    className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                    aria-label={`Copy ${item.label}`}
                  >
                    {copiedField === item.key ? (
                      <Check size={13} className="text-primary" />
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="mt-6 text-xs text-muted-foreground text-center">
        By continuing, you agree to EVRide&apos;s terms of service
      </p>
    </div>
  );
}