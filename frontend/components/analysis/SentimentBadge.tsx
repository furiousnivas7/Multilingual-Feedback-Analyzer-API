import { TrendingUp, TrendingDown, Minus, ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SentimentLabel } from '@/types/api';

const STYLES: Record<SentimentLabel, { badge: string; icon: React.ElementType }> = {
  positive: { badge: 'bg-green-100 text-green-800 border-green-200', icon: TrendingUp },
  negative: { badge: 'bg-red-100 text-red-800 border-red-200', icon: TrendingDown },
  neutral: { badge: 'bg-slate-100 text-slate-700 border-slate-200', icon: Minus },
  mixed: { badge: 'bg-amber-100 text-amber-800 border-amber-200', icon: ArrowLeftRight },
};

interface SentimentBadgeProps {
  sentiment: SentimentLabel;
  confidence?: number;
  showConfidence?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function SentimentBadge({
  sentiment,
  confidence,
  showConfidence = false,
  size = 'md',
}: SentimentBadgeProps) {
  const { badge, icon: Icon } = STYLES[sentiment];
  const label = sentiment.charAt(0).toUpperCase() + sentiment.slice(1);

  return (
    <div className="flex flex-col gap-1">
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full border font-medium capitalize',
          badge,
          size === 'sm' && 'text-xs px-2 py-0.5',
          size === 'md' && 'text-xs px-2.5 py-1',
          size === 'lg' && 'text-sm px-3 py-1.5'
        )}
        aria-label={`Sentiment: ${label}`}
      >
        <Icon className={cn('shrink-0', size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} aria-hidden="true" />
        {label}
      </span>
      {showConfidence && confidence !== undefined && (
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full bg-current opacity-60"
            style={{ width: `${Math.round(confidence * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
