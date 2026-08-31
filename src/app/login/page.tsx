'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  UserCheck,
  Sparkles,
  KeyRound,
} from 'lucide-react';
import { toast } from 'sonner';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Ingresa tu correo y contraseña');
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
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      toast.success(data.message || 'Inicio de sesión exitoso');
      router.push(redirect);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
  };

  return (
    <div className="w-full max-w-md relative z-10 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-blue-500/20">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          PropDesk IT Support
        </h1>
        <p className="text-xs text-slate-400">
          Acceso Privado para Administración de Incidencias de Real Estate
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="luis@propdeskit.com"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <span>Verificando...</span>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                Iniciar Sesión en el Panel
              </>
            )}
          </button>
        </form>

        {/* Quick 1-Click Access Buttons */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block text-center">
            ⚡ Accesos Rápidos Preconfigurados
          </span>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('luis@propdeskit.com', 'admin123')}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold">
                <UserCheck className="w-3.5 h-3.5" />
                Luis (IT Lead)
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                admin123
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('boss@propdeskit.com', 'boss123')}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-purple-400 text-xs font-bold">
                <UserCheck className="w-3.5 h-3.5" />
                Jefe (Executive)
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                boss123
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Public Submit Link */}
      <div className="text-center">
        <a
          href="/submit"
          className="text-xs font-medium text-slate-400 hover:text-blue-400 transition-colors inline-flex items-center gap-1"
        >
          ¿Eres un agente o inquilino? Ir al formulario público de reporte <ArrowRight className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-blue-500 selection:text-white relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <Suspense fallback={<div className="text-slate-500">Cargando formulario...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
