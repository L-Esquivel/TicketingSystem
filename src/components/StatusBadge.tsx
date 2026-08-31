import React from 'react';
import { Status } from '../types';
import { STATUS_CONFIG } from '../lib/utils';
import { Clock, PlayCircle, PauseCircle, CheckCircle2, Archive } from 'lucide-react';

interface StatusBadgeProps {
  status: Status | string;
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({ status, showIcon = true, className = '' }: StatusBadgeProps) {
  const s = (status?.toUpperCase() || 'OPEN') as Status;
  const config = STATUS_CONFIG[s] || STATUS_CONFIG.OPEN;

  const renderIcon = () => {
    switch (s) {
      case 'OPEN':
        return <Clock className="w-3.5 h-3.5 text-amber-500" />;
      case 'IN_PROGRESS':
        return <PlayCircle className="w-3.5 h-3.5 text-blue-500" />;
      case 'WAITING':
        return <PauseCircle className="w-3.5 h-3.5 text-purple-500" />;
      case 'RESOLVED':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      case 'CLOSED':
        return <Archive className="w-3.5 h-3.5 text-slate-500" />;
      default:
        return null;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.color} ${className}`}
    >
      {showIcon && renderIcon()}
      <span>{config.label}</span>
    </span>
  );
}
