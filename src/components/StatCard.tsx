import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: 'indigo' | 'emerald' | 'amber' | 'rose' | 'blue' | 'purple';
  trend?: {
    value: string;
    positive: boolean;
  };
}

const colorStyles = {
  indigo: {
    bg: 'bg-indigo-50/60',
    iconBg: 'bg-indigo-600',
    text: 'text-indigo-600',
    border: 'border-indigo-100',
  },
  emerald: {
    bg: 'bg-emerald-50/60',
    iconBg: 'bg-emerald-600',
    text: 'text-emerald-600',
    border: 'border-emerald-100',
  },
  amber: {
    bg: 'bg-amber-50/60',
    iconBg: 'bg-amber-600',
    text: 'text-amber-600',
    border: 'border-amber-100',
  },
  rose: {
    bg: 'bg-rose-50/60',
    iconBg: 'bg-rose-600',
    text: 'text-rose-600',
    border: 'border-rose-100',
  },
  blue: {
    bg: 'bg-blue-50/60',
    iconBg: 'bg-blue-600',
    text: 'text-blue-600',
    border: 'border-blue-100',
  },
  purple: {
    bg: 'bg-purple-50/60',
    iconBg: 'bg-purple-600',
    text: 'text-purple-600',
    border: 'border-purple-100',
  }
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend
}) => {
  const styles = colorStyles[color];

  return (
    <div className={`p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs transition-all hover:shadow-md hover:border-slate-300`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${styles.iconBg} shadow-sm`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold tracking-tight text-slate-900">{value}</div>
        {(subtitle || trend) && (
          <div className="mt-1 flex items-center gap-2 text-xs">
            {trend && (
              <span className={`font-semibold ${trend.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {trend.positive ? '↑' : '↓'} {trend.value}
              </span>
            )}
            {subtitle && <span className="text-slate-500">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
