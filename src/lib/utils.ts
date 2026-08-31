import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM dd, yyyy HH:mm');
}

export function formatTimeAgo(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: enUS });
}

export const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  HARDWARE: { label: 'Hardware & Devices', icon: 'Laptop' },
  SOFTWARE: { label: 'Software & Applications', icon: 'AppWindow' },
  NETWORK: { label: 'Network & Internet Connectivity', icon: 'Wifi' },
  ACCESS: { label: 'Access & Passwords / SSO', icon: 'Key' },
  EMAIL: { label: 'Email & Google Workspace / Gmail', icon: 'Mail' },
  MLS_REALTY: { label: 'MLS / Real Estate Platforms', icon: 'Building2' },
  PRINTER_PERIPHERALS: { label: 'Printers & Peripherals', icon: 'Printer' },
  SECURITY: { label: 'Security & Phishing', icon: 'ShieldAlert' },
  GENERAL: { label: 'General IT Support', icon: 'HelpCircle' },
};

export const PRIORITY_CONFIG = {
  LOW: {
    label: 'Low',
    color: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700',
    dot: 'bg-slate-400',
  },
  MEDIUM: {
    label: 'Medium',
    color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
    dot: 'bg-blue-500',
  },
  HIGH: {
    label: 'High',
    color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    dot: 'bg-amber-500',
  },
  CRITICAL: {
    label: 'Critical',
    color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800 animate-pulse',
    dot: 'bg-rose-600',
  },
};

export const STATUS_CONFIG = {
  OPEN: {
    label: 'Open',
    color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    badgeClass: 'text-amber-700 dark:text-amber-300 bg-amber-100/60 dark:bg-amber-900/30',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    badgeClass: 'text-blue-700 dark:text-blue-300 bg-blue-100/60 dark:bg-blue-900/30',
  },
  WAITING: {
    label: 'Waiting / On Hold',
    color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    badgeClass: 'text-purple-700 dark:text-purple-300 bg-purple-100/60 dark:bg-purple-900/30',
  },
  RESOLVED: {
    label: 'Resolved',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    badgeClass: 'text-emerald-700 dark:text-emerald-300 bg-emerald-100/60 dark:bg-emerald-900/30',
  },
  CLOSED: {
    label: 'Closed',
    color: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    badgeClass: 'text-slate-700 dark:text-slate-400 bg-slate-200 dark:bg-slate-800',
  },
};
