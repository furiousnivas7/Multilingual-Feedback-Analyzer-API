import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-[#F5F7FA] p-6">
        <svg
          className="h-12 w-12 text-[#94A3B8]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-[#1E293B]">{title}</h3>
      <p className="mt-1 text-sm text-[#64748B] max-w-xs">{description}</p>
      {action && (
        <Button className="mt-4 bg-[#1A3C5E] hover:bg-[#2E75B6]" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
