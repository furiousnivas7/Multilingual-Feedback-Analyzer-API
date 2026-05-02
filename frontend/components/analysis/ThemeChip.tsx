import { cn } from '@/lib/utils';
import type { ThemeLabel } from '@/types/api';

const LABEL_MAP: Record<ThemeLabel, string> = {
  service: 'Service',
  price: 'Price',
  quality: 'Quality',
  delivery: 'Delivery',
  staff: 'Staff',
  food: 'Food',
  app_ux: 'App UX',
  billing: 'Billing',
  other: 'Other',
};

interface ThemeChipProps {
  theme: ThemeLabel;
  size?: 'sm' | 'md';
}

export function ThemeChip({ theme, size = 'md' }: ThemeChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md bg-[#F5F7FA] text-[#1E293B] border border-[#E2E8F0] font-medium',
        size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-1'
      )}
    >
      {LABEL_MAP[theme] ?? theme}
    </span>
  );
}
