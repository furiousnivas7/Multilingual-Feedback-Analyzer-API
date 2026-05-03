'use client';

import { use } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useFeedbackList } from '@/hooks/useFeedback';
import { FeedbackTable } from '@/components/feedback/FeedbackTable';
import { FeedbackFilters } from '@/components/feedback/FeedbackFilters';
import { FeedbackForm } from '@/components/feedback/FeedbackForm';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { FeedbackFilters as FeedbackFiltersType } from '@/types/api';

interface Props {
  params: Promise<{ id: string }>;
}

function FeedbackContent({ projectId }: { projectId: string }) {
  const searchParams = useSearchParams();

  const filters: FeedbackFiltersType = {
    page: Number(searchParams.get('page') ?? 1),
    limit: 20,
    sentiment: searchParams.get('sentiment') ?? undefined,
    lang: searchParams.get('lang') ?? undefined,
    theme: searchParams.get('theme') ?? undefined,
    search: searchParams.get('search') ?? undefined,
  };

  const { data, isLoading } = useFeedbackList(projectId, filters);
  const router = useRouter();

  const page = filters.page ?? 1;
  const total = data?.total ?? 0;
  const limit = filters.limit ?? 20;
  const totalPages = Math.ceil(total / limit);

  function goToPage(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <FeedbackFilters />

      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : !data || data.data.length === 0 ? (
        <EmptyState
          title="No feedback found"
          description="Submit feedback below or adjust your filters."
        />
      ) : (
        <>
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>
              {total} result{total !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span>
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => goToPage(page + 1)}
                className="h-7 w-7 p-0"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <FeedbackTable items={data.data} />
        </>
      )}
    </div>
  );
}

export default function FeedbackPage({ params }: Props) {
  const { id } = use(params);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#1A3C5E]">Feedback</h1>
        <p className="text-sm text-[#64748B] mt-0.5">
          View analyzed feedback or submit new entries
        </p>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
        <h2 className="text-sm font-semibold text-[#1E293B] mb-4">Submit Feedback</h2>
        <FeedbackForm projectId={id} />
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
        <h2 className="text-sm font-semibold text-[#1E293B] mb-4">All Feedback</h2>
        <Suspense fallback={<TableSkeleton rows={8} />}>
          <FeedbackContent projectId={id} />
        </Suspense>
      </div>
    </div>
  );
}
