'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Ticket,
  Building2,
  PlusCircle,
  ShieldCheck,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';

interface SidebarProps {
  onOpenCreateTicket?: () => void;
  onOpenCreateCompany?: () => void;
}

export function Sidebar({ onOpenCreateTicket }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setCurrentUser(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Logged out successfully');
      router.push('/login');
      router.refresh();
    } catch (err) {
      toast.error('Error logging out');
    }
  };

  const navItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      active: pathname === '/',
    },
    {
      name: 'Incidents & Tickets',
      href: '/tickets',
      icon: Ticket,
      active: pathname === '/tickets' || pathname.startsWith('/tickets/'),
    },
    {
      name: 'Companies & Prefixes',
      href: '/companies',
      icon: Building2,
      active: pathname === '/companies',
    },
    {
      name: 'Client Submit Portal',
      href: '/submit',
      icon: PlusCircle,
      active: pathname === '/submit',
    },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen sticky top-0 z-30 transition-colors">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-base text-slate-900 dark:text-white leading-tight tracking-tight">
            PropDesk IT
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Real Estate IT Support
          </p>
        </div>
      </div>

      {/* Quick Action Button */}
      <div className="p-4">
        {onOpenCreateTicket ? (
          <button
            onClick={onOpenCreateTicket}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm shadow-sm transition-all hover:shadow hover:shadow-blue-500/25 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            New Incident
          </button>
        ) : (
          <Link
            href="/submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm shadow-sm transition-all hover:shadow hover:shadow-blue-500/25"
          >
            <PlusCircle className="w-4 h-4" />
            New Incident
          </Link>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                item.active
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  item.active
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User / Logout Profile Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
            {currentUser?.name?.[0] || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
              {currentUser?.name || 'Luis Esquivel'}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
              {currentUser?.role === 'SUPER_ADMIN' ? 'Super Admin IT Lead' : 'Executive Director'}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Log out"
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
