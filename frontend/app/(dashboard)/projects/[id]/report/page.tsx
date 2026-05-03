'use client';

import { use } from 'react';
import { useReport, useSentimentTrend, useThemes } from '@/hooks/useReport';
import { KpiCard } from '@/components/shared/KpiCard';
import { KpiRowSkeleton, ChartSkeleton } from '@/components/shared/LoadingSkeleton';
import { SentimentTrendChart } from '@/components/charts/SentimentTrendChart';
import { LanguageDonut } from '@/components/charts/LanguageDonut';
import { ThemeBarChart } from '@/components/charts/ThemeBarChart';
import { Button } from '@/components/ui/button';
import {
  MessageSquare,
  TrendingUp,
  TrendingDown,
  BarChart2,
  Download,
  Minus,
  AlertTriangle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Props {
  params: Promise<{ id: string }>;
}

export default function ReportPage({ params }: Props) {
  const { id } = use(params);
  const { data: report, isLoading: reportLoading } = useReport(id);
  const { data: trend, isLoading: trendLoading } = useSentimentTrend(id);
  const { data: themes, isLoading: themesLoading } = useThemes(id);

  async function exportCsv() {
    try {
      const res = await api.get(`/api/v1/analysis/export/${id}`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${id}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Export failed');
    }
  }

  const positiveRate = report
    ? Math.round((report.sentimentBreakdown.positive / (report.totalFeedback || 1)) * 100)
    : 0;
  const negativeRate = report
    ? Math.round((report.sentimentBreakdown.negative / (report.totalFeedback || 1)) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1A3C5E]">Analytics Report</h1>
          <p className="text-sm text-[#64748B] mt-0.5">Full sentiment, language & theme breakdown</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv} className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {reportLoading ? (
        <KpiRowSkeleton />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <KpiCard
            title="Total Feedback"
            value={report?.totalFeedback ?? 0}
            icon={<MessageSquare className="h-5 w-5" />}
            accentColor="#2E75B6"
          />
          <KpiCard
            title="Positive"
            value={`${positiveRate}%`}
            icon={<TrendingUp className="h-5 w-5" />}
            accentColor="#22C55E"
          />
          <KpiCard
            title="Negative"
            value={`${negativeRate}%`}
            icon={<TrendingDown className="h-5 w-5" />}
            accentColor="#EF4444"
          />
          <KpiCard
            title="Neutral"
            value={report?.sentimentBreakdown.neutral ?? 0}
            icon={<Minus className="h-5 w-5" />}
            accentColor="#94A3B8"
          />
          <KpiCard
            title="Sarcastic"
            value={report?.sarcasticCount ?? 0}
            icon={<AlertTriangle className="h-5 w-5" />}
            accentColor="#F59E0B"
          />
          <KpiCard
            title="Avg Confidence"
            value={report ? `${Math.round((report.avgConfidence ?? 0) * 100)}%` : '—'}
            icon={<BarChart2 className="h-5 w-5" />}
            accentColor="#8B5CF6"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
          <h2 className="text-sm font-semibold text-[#1E293B] mb-4">Sentiment Over Time</h2>
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

      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
        <h2 className="text-sm font-semibold text-[#1E293B] mb-4">Theme Performance</h2>
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

      {report && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <h2 className="text-sm font-semibold text-[#1E293B] mb-4">Sentiment Breakdown</h2>
            <div className="space-y-3">
              {(
                [
                  { label: 'Positive', key: 'positive', color: '#22C55E' },
                  { label: 'Negative', key: 'negative', color: '#EF4444' },
                  { label: 'Neutral', key: 'neutral', color: '#94A3B8' },
                  { label: 'Mixed', key: 'mixed', color: '#F59E0B' },
                ] as const
              ).map(({ label, key, color }) => {
                const count = report.sentimentBreakdown[key];
                const pct = Math.round((count / (report.totalFeedback || 1)) * 100);
                return (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#475569]">{label}</span>
                      <span className="text-[#64748B]">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <h2 className="text-sm font-semibold text-[#1E293B] mb-4">Quick Stats</h2>
            <div className="space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-[#64748B]">Code-mix entries</span>
                <span className="font-medium text-[#1E293B]">{report.codeMixCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#64748B]">Sarcastic entries</span>
                <span className="font-medium text-[#1E293B]">{report.sarcasticCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#64748B]">Average confidence</span>
                <span className="font-medium text-[#1E293B]">
                  {Math.round((report.avgConfidence ?? 0) * 100)}%
                </span>
              </div>
              {report.period && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">From</span>
                    <span className="font-medium text-[#1E293B]">
                      {new Date(report.period.from).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">To</span>
                    <span className="font-medium text-[#1E293B]">
                      {new Date(report.period.to).toLocaleDateString()}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
