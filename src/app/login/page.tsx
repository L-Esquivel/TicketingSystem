'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  KeyRound,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid credentials');
      }

      toast.success(data.message || 'Login successful!');
      router.push(redirectPath);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error during login');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (fillEmail: string, fillPass: string) => {
    setEmail(fillEmail);
    setPassword(fillPass);
    toast.info(`Loaded credentials for ${fillEmail}`);
  };

  return (
    <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 backdrop-blur-xl p-8 rounded-3xl shadow-2xl space-y-6">
      {/* Brand & Title */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-500/25">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          PropDesk IT Support
        </h1>
        <p className="text-xs text-slate-400">
          Private IT Incident Administration for Real Estate Operations
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="luis@propdeskit.com"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <span>Signing in...</span>
          ) : (
            <>
              <KeyRound className="w-4 h-4" />
              Sign In to Dashboard
            </>
          )}
        </button>
      </form>

      {/* Quick Credentials Switcher */}
      <div className="pt-4 border-t border-slate-800/80 space-y-2">
        <p className="text-[11px] font-semibold text-slate-400 text-center uppercase tracking-wider flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          Preconfigured Quick Access
        </p>

        <div className="grid grid-cols-2 gap-2 text-left">
          <button
            type="button"
            onClick={() => handleQuickFill('luis@propdeskit.com', 'admin123')}
            className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-blue-500/50 text-xs transition-all text-slate-300 cursor-pointer"
          >
            <div className="font-bold text-white flex items-center gap-1">
              🛠️ Luis (IT Lead)
            </div>
            <div className="text-[10px] text-slate-400 font-mono">admin123</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickFill('boss@propdeskit.com', 'boss123')}
            className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 text-xs transition-all text-slate-300 cursor-pointer"
          >
            <div className="font-bold text-white flex items-center gap-1">
              👔 Director (Boss)
            </div>
            <div className="text-[10px] text-slate-400 font-mono">boss123</div>
          </button>
        </div>
      </div>

      <div className="text-center pt-2">
        <a
          href="/submit"
          className="text-xs text-slate-400 hover:text-blue-400 transition-colors"
        >
          Are you a realtor or tenant? Go to public submit portal →
        </a>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-4 selection:bg-blue-500 selection:text-white">
      <Suspense fallback={<div className="text-slate-400 text-sm">Loading login...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
