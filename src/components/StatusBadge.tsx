import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, AlertCircle } from 'lucide-react';
import { FeePaymentStatus } from '../types';

interface StatusBadgeProps {
  status: FeePaymentStatus | string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', size = 'md' }) => {
  const normalized = status?.toUpperCase() || 'PENDING';

  let config = {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    label: 'PAID'
  };

  if (normalized === 'PAID') {
    config = {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
      label: 'PAID'
    };
  } else if (normalized === 'PARTIALLY PAID') {
    config = {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: <Clock className="w-3.5 h-3.5 text-amber-600" />,
      label: 'PARTIALLY PAID'
    };
  } else if (normalized === 'OVERDUE') {
    config = {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: <AlertCircle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />,
      label: 'OVERDUE'
    };
  } else {
    config = {
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-indigo-600" />,
      label: normalized === 'NO FEES ASSIGNED' ? 'NO FEES' : 'PENDING'
    };
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2'
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-xs transition-colors ${config.bg} ${sizeClasses} ${className}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};
