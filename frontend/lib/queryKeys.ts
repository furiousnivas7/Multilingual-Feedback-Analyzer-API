import type { FeedbackFilters } from '@/types/api';

export const queryKeys = {
  user: ['user'] as const,
  projects: {
    all: ['projects'] as const,
    detail: (id: string) => ['projects', id] as const,
  },
  feedback: {
    list: (projectId: string, filters: FeedbackFilters) =>
      ['feedback', projectId, filters] as const,
    detail: (id: string) => ['feedback', id] as const,
  },
  analysis: {
    report: (projectId: string, period?: object) =>
      ['report', projectId, period ?? {}] as const,
    sentiment: (projectId: string) => ['sentiment', projectId] as const,
    themes: (projectId: string) => ['themes', projectId] as const,
  },
  batchJobs: {
    list: (projectId: string) => ['batchJobs', projectId] as const,
    detail: (id: string) => ['batchJobs', id] as const,
  },
  alerts: ['alerts'] as const,
  apiKeys: ['apiKeys'] as const,
};
