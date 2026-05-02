import { TrendingUp, TrendingDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

type AccentColor = 'blue' | 'green' | 'red' | 'amber' | 'slate';

const ACCENT: Record<AccentColor, string> = {
  blue: 'border-l-[#2E75B6]',
  green: 'border-l-[#22C55E]',
  red: 'border-l-[#EF4444]',
  amber: 'border-l-[#F59E0B]',
  slate: 'border-l-[#94A3B8]',
};

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; direction: 'up' | 'down' | 'neutral' };
  accentColor?: AccentColor;
  loading?: boolean;
}

export function KpiCard({
  title,
  value,
  icon: Icon,
  trend,
  accentColor = 'blue',
  loading,
}: KpiCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-[#E2E8F0] p-6 border-l-4 border-l-[#E2E8F0]">
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-3 w-16" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-[#E2E8F0] p-6 border-l-4',
        ACCENT[accentColor]
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-[#1E293B]">{value}</p>
          {trend && (
            <div
              className={cn(
                'mt-1 flex items-center gap-1 text-xs font-medium',
                trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
              )}
            >
              {trend.direction === 'up' ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {trend.value > 0 ? '+' : ''}{trend.value}% vs last 7d
            </div>
          )}
        </div>
        <div className="rounded-lg bg-[#F5F7FA] p-2">
          <Icon className="h-5 w-5 text-[#2E75B6]" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
