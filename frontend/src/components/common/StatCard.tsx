import React from 'react';
import type { IconType } from 'react-icons';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: IconType;
  color?: 'blue' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'purple';
  trend?: {
    value: string;
    isPositive: boolean;
  };
  subtitle?: string;
  onClick?: () => void;
}

const colorStyles = {
  blue: {
    bg: 'bg-primary-50 text-primary-600',
    border: 'border-primary-100',
    ring: 'hover:border-primary-300'
  },
  emerald: {
    bg: 'bg-emerald-50 text-emerald-600',
    border: 'border-emerald-100',
    ring: 'hover:border-emerald-300'
  },
  amber: {
    bg: 'bg-amber-50 text-amber-600',
    border: 'border-amber-100',
    ring: 'hover:border-amber-300'
  },
  rose: {
    bg: 'bg-rose-50 text-rose-600',
    border: 'border-rose-100',
    ring: 'hover:border-rose-300'
  },
  indigo: {
    bg: 'bg-indigo-50 text-indigo-600',
    border: 'border-indigo-100',
    ring: 'hover:border-indigo-300'
  },
  purple: {
    bg: 'bg-purple-50 text-purple-600',
    border: 'border-purple-100',
    ring: 'hover:border-purple-300'
  }
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color = 'blue',
  trend,
  subtitle,
  onClick
}) => {
  const styles = colorStyles[color];

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md ' + styles.ring : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <div className={`p-2.5 rounded-lg ${styles.bg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </span>
        {trend && (
          <span
            className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
              trend.isPositive
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-rose-50 text-rose-700'
            }`}
          >
            {trend.isPositive ? '+' : ''}
            {trend.value}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-slate-400 font-medium">{subtitle}</p>
      )}
    </div>
  );
};
