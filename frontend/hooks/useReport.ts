'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import type { SentimentReport, SentimentTrendPoint, ThemeStat } from '@/types/api';

export function useReport(projectId: string) {
  return useQuery<SentimentReport>({
    queryKey: queryKeys.analysis.report(projectId),
    queryFn: async () => {
      const res = await api.get<{ data: SentimentReport }>(
        `/api/v1/analysis/report/${projectId}`
      );
      return res.data.data;
    },
    staleTime: 60_000,
    enabled: !!projectId,
  });
}

export function useSentimentTrend(projectId: string) {
  return useQuery<SentimentTrendPoint[]>({
    queryKey: queryKeys.analysis.sentiment(projectId),
    queryFn: async () => {
      const res = await api.get<{ data: SentimentTrendPoint[] }>(
        `/api/v1/analysis/sentiment/${projectId}`
      );
      return res.data.data;
    },
    staleTime: 60_000,
    enabled: !!projectId,
  });
}

export function useThemes(projectId: string) {
  return useQuery<ThemeStat[]>({
    queryKey: queryKeys.analysis.themes(projectId),
    queryFn: async () => {
      const res = await api.get<{ data: ThemeStat[] }>(
        `/api/v1/analysis/themes/${projectId}`
      );
      return res.data.data;
    },
    staleTime: 60_000,
    enabled: !!projectId,
  });
}
