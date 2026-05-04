'use client';

import { useProjects } from '@/hooks/useProjects';
import { useAlerts } from '@/hooks/useAlerts';
import { useReport, useSentimentTrend, useThemes } from '@/hooks/useReport';
import { useAppStore } from '@/store/appStore';
import { KpiCard } from '@/components/shared/KpiCard';
import { KpiRowSkeleton, ChartSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { SentimentTrendChart } from '@/components/charts/SentimentTrendChart';
import { LanguageDonut } from '@/components/charts/LanguageDonut';
import { ThemeBarChart } from '@/components/charts/ThemeBarChart';
import { useRouter } from 'next/navigation';
import { MessageSquare, TrendingUp, AlertTriangle, BarChart2 } from 'lucide-react';

export default function OverviewPage() {
  const router = useRouter();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: alerts } = useAlerts();

  const activeProjectId = useAppStore((s) => s.activeProjectId);
  const firstProjectId = projects?.[0]?.id ?? '';
  const projectId = activeProjectId ?? firstProjectId;

  const { data: report, isLoading: reportLoading } = useReport(projectId);
  const { data: trend, isLoading: trendLoading } = useSentimentTrend(projectId);
  const { data: themes, isLoading: themesLoading } = useThemes(projectId);

  const unresolvedAlerts = alerts?.filter((a) => !a.isResolved) ?? [];

  if (!projectsLoading && (!projects || projects.length === 0)) {
    return (
      <EmptyState
        title="No projects yet"
        description="Create your first project to start analyzing multilingual feedback."
        action={{ label: 'Create project', onClick: () => router.push('/projects/new') }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#1A3C5E]">Overview</h1>
        <p className="text-sm text-[#64748B] mt-0.5">
          {projects?.find((p) => p.id === projectId)?.name ?? 'Loading…'}
        </p>
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
            title="Positive Rate"
            value={
              report
                ? `${Math.round(
                    (report.sentimentBreakdown.positive / (report.totalFeedback || 1)) * 100
                  )}%`
                : '—'
            }
            icon={<TrendingUp className="h-5 w-5" />}
            accentColor="#22C55E"
          />
          <KpiCard
            title="Avg Confidence"
            value={report ? `${Math.round((report.avgConfidence ?? 0) * 100)}%` : '—'}
            icon={<BarChart2 className="h-5 w-5" />}
            accentColor="#8B5CF6"
          />
          <KpiCard
            title="Active Alerts"
            value={unresolvedAlerts.length}
            icon={<AlertTriangle className="h-5 w-5" />}
            accentColor={unresolvedAlerts.length > 0 ? '#EF4444' : '#22C55E'}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
          <h2 className="text-sm font-semibold text-[#1E293B] mb-4">Sentiment Trend</h2>
          {trendLoading ? (
            <ChartSkeleton height={300} />
          ) : trend && trend.length > 0 ? (
            <SentimentTrendChart data={trend} />
          ) : (
            <div className="flex items-center justify-center h-[300px] text-sm text-[#94A3B8]">
              No trend data yet
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
          <h2 className="text-sm font-semibold text-[#1E293B] mb-4">Language Distribution</h2>
          {reportLoading ? (
            <ChartSkeleton height={260} />
          ) : report ? (
            <LanguageDonut data={report.languageBreakdown} />
          ) : (
            <div className="flex items-center justify-center h-[260px] text-sm text-[#94A3B8]">
              No data yet
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
          <h2 className="text-sm font-semibold text-[#1E293B] mb-4">Top Themes</h2>
          {themesLoading ? (
            <ChartSkeleton height={260} />
          ) : themes && themes.length > 0 ? (
            <ThemeBarChart data={themes} />
          ) : (
            <div className="flex items-center justify-center h-[260px] text-sm text-[#94A3B8]">
              No theme data yet
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
          <h2 className="text-sm font-semibold text-[#1E293B] mb-4">Recent Alerts</h2>
          {unresolvedAlerts.length === 0 ? (
            <div className="flex items-center justify-center h-[260px] text-sm text-[#94A3B8]">
              No active alerts
            </div>
          ) : (
            <div className="space-y-2">
              {unresolvedAlerts.slice(0, 6).map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA]"
                >
                  <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#1E293B] truncate">{alert.title}</p>
                    <p className="text-xs text-[#64748B] truncate">{alert.message}</p>
                  </div>
                  <span
                    className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                      alert.severity === 'critical'
                        ? 'bg-red-100 text-red-700'
                        : alert.severity === 'high'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
