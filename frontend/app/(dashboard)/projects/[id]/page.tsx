'use client';

import { use } from 'react';
import Link from 'next/link';
import { useProject } from '@/hooks/useProjects';
import { useReport } from '@/hooks/useReport';
import { KpiCard } from '@/components/shared/KpiCard';
import { KpiRowSkeleton } from '@/components/shared/LoadingSkeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Upload, BarChart2, TrendingUp, Minus } from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: Props) {
  const { id } = use(params);
  const { data: project, isLoading: projectLoading } = useProject(id);
  const { data: report, isLoading: reportLoading } = useReport(id);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          {projectLoading ? (
            <Skeleton className="h-7 w-48 mb-1" />
          ) : (
            <h1 className="text-xl font-bold text-[#1A3C5E]">{project?.name}</h1>
          )}
          {project?.description && (
            <p className="text-sm text-[#64748B] mt-0.5">{project.description}</p>
          )}
        </div>
      </div>

      {reportLoading ? (
        <KpiRowSkeleton />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Total Feedback"
            value={report?.totalFeedback ?? 0}
            icon={<MessageSquare className="h-5 w-5" />}
            accentColor="#2E75B6"
          />
          <KpiCard
            title="Positive"
            value={report?.sentimentBreakdown.positive ?? 0}
            icon={<TrendingUp className="h-5 w-5" />}
            accentColor="#22C55E"
          />
          <KpiCard
            title="Negative"
            value={report?.sentimentBreakdown.negative ?? 0}
            icon={<Minus className="h-5 w-5" />}
            accentColor="#EF4444"
          />
          <KpiCard
            title="Avg Confidence"
            value={report ? `${Math.round((report.avgConfidence ?? 0) * 100)}%` : '—'}
            icon={<BarChart2 className="h-5 w-5" />}
            accentColor="#8B5CF6"
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href={`/projects/${id}/feedback`}>
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 hover:border-[#2E75B6] hover:shadow-sm transition-all cursor-pointer">
            <MessageSquare className="h-6 w-6 text-[#2E75B6] mb-3" />
            <h3 className="font-semibold text-[#1E293B]">Feedback</h3>
            <p className="text-sm text-[#64748B] mt-1">View and submit individual feedback entries</p>
          </div>
        </Link>

        <Link href={`/projects/${id}/upload`}>
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 hover:border-[#2E75B6] hover:shadow-sm transition-all cursor-pointer">
            <Upload className="h-6 w-6 text-[#8B5CF6] mb-3" />
            <h3 className="font-semibold text-[#1E293B]">Batch Upload</h3>
            <p className="text-sm text-[#64748B] mt-1">Upload CSV or Excel files for bulk analysis</p>
          </div>
        </Link>

        <Link href={`/projects/${id}/report`}>
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 hover:border-[#2E75B6] hover:shadow-sm transition-all cursor-pointer">
            <BarChart2 className="h-6 w-6 text-[#22C55E] mb-3" />
            <h3 className="font-semibold text-[#1E293B]">Analytics Report</h3>
            <p className="text-sm text-[#64748B] mt-1">Full sentiment, language & theme breakdown</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
