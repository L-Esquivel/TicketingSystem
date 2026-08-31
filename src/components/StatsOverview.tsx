'use client';

import React from 'react';
import { TicketStats } from '@/types';
import {
  Ticket,
  Clock,
  PlayCircle,
  Flame,
  CheckCircle2,
  Building2,
  TrendingUp,
} from 'lucide-react';

interface StatsOverviewProps {
  stats: TicketStats | null;
  loading?: boolean;
}

export function StatsOverview({ stats, loading = false }: StatsOverviewProps) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse h-24"
          />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: 'Total Incidencias',
      value: stats.total,
      icon: Ticket,
      color: 'text-slate-600 dark:text-slate-300',
      bgColor: 'bg-slate-100 dark:bg-slate-800',
      borderColor: 'border-slate-200 dark:border-slate-800',
    },
    {
      label: 'Abiertas (Pendientes)',
      value: stats.open,
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
      borderColor: 'border-amber-200 dark:border-amber-800/60',
    },
    {
      label: 'En Atención / Progreso',
      value: stats.inProgress + stats.waiting,
      icon: PlayCircle,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40',
      borderColor: 'border-blue-200 dark:border-blue-800/60',
    },
    {
      label: 'Críticas / Urgentes',
      value: stats.critical,
      icon: Flame,
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-50 dark:bg-rose-950/40',
      borderColor: 'border-rose-200 dark:border-rose-800/60',
      alert: stats.critical > 0,
    },
    {
      label: 'Resueltas & Cerradas',
      value: stats.resolved + stats.closed,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      borderColor: 'border-emerald-200 dark:border-emerald-800/60',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`p-4 rounded-xl bg-white dark:bg-slate-900 border ${card.borderColor} shadow-sm transition-all hover:shadow-md flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {card.label}
              </span>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {card.value}
              </span>
              {card.alert && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 animate-pulse">
                  Requiere Acción
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
