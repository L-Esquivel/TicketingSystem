'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Search, Sun, Moon } from 'lucide-react';
import { Company } from '../types';

interface NavbarProps {
  selectedCompanyId?: string;
  onCompanyChange?: (companyId: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onOpenCreateTicket?: () => void;
}

export function Navbar({
  selectedCompanyId = 'ALL',
  onCompanyChange,
  searchQuery = '',
  onSearchChange,
}: NavbarProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    fetch('/api/companies')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCompanies(data.data);
        }
      })
      .catch(console.error);

    // Dark mode check
    if (typeof window !== 'undefined') {
      const isDarkMode = document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(isDarkMode);
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-20 px-6 flex items-center justify-between gap-4 transition-colors">
      {/* Left: Company Isolation Filter Switcher */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/60">
          <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden sm:inline">
            Company:
          </span>
          <select
            value={selectedCompanyId}
            onChange={(e) => onCompanyChange?.(e.target.value)}
            className="bg-transparent text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
          >
            <option value="ALL" className="dark:bg-slate-900 text-slate-800 dark:text-slate-200">
              🏢 All Businesses (Global IT View)
            </option>
            {companies.map((company) => (
              <option
                key={company.id}
                value={company.id}
                className="dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              >
                {company.prefix} - {company.name} ({company._count?.tickets ?? 0} tickets)
              </option>
            ))}
          </select>
        </div>

        {selectedCompanyId !== 'ALL' && (
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            Isolated View Active
          </span>
        )}
      </div>

      {/* Center/Right: Search and Controls */}
      <div className="flex items-center gap-3">
        {onSearchChange && (
          <div className="relative hidden md:block w-64 lg:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by ticket #, requester, subject..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
            />
          </div>
        )}

        <button
          onClick={toggleDarkMode}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400 hidden sm:inline">
            IT Service Online
          </span>
        </div>
      </div>
    </header>
  );
}
