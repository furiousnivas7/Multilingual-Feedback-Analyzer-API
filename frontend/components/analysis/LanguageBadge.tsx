import { cn } from '@/lib/utils';
import type { DetectedLanguage } from '@/types/api';

const STYLES: Record<DetectedLanguage, { badge: string; label: string }> = {
  tamil: { badge: 'bg-purple-100 text-purple-800', label: 'Tamil' },
  sinhala: { badge: 'bg-blue-100 text-blue-800', label: 'Sinhala' },
  english: { badge: 'bg-gray-100 text-gray-700', label: 'English' },
  singlish: { badge: 'bg-cyan-100 text-cyan-800', label: 'Singlish' },
  tanglish: { badge: 'bg-indigo-100 text-indigo-800', label: 'Tanglish' },
  mixed_other: { badge: 'bg-orange-100 text-orange-800', label: 'Mixed' },
  unknown: { badge: 'bg-stone-100 text-stone-600', label: 'Unknown' },
};

interface LanguageBadgeProps {
  language: DetectedLanguage;
  size?: 'sm' | 'md';
}

export function LanguageBadge({ language, size = 'md' }: LanguageBadgeProps) {
  const { badge, label } = STYLES[language] ?? STYLES.unknown;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        badge,
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'
      )}
      aria-label={`Language: ${label}`}
    >
      {label}
    </span>
  );
}
