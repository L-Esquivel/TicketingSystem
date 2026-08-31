import React from 'react';
import { Priority } from '../types';
import { PRIORITY_CONFIG } from '../lib/utils';
import { AlertCircle, AlertTriangle, ArrowDown, Flame } from 'lucide-react';

interface PriorityBadgeProps {
  priority: Priority | string;
  showIcon?: boolean;
  className?: string;
}

export function PriorityBadge({ priority, showIcon = true, className = '' }: PriorityBadgeProps) {
  const p = (priority?.toUpperCase() || 'MEDIUM') as Priority;
  const config = PRIORITY_CONFIG[p] || PRIORITY_CONFIG.MEDIUM;

  const renderIcon = () => {
    switch (p) {
      case 'CRITICAL':
        return <Flame className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />;
      case 'HIGH':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
      case 'MEDIUM':
        return <AlertCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
      case 'LOW':
        return <ArrowDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />;
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
