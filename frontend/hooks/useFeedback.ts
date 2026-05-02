'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { getErrorMessage } from '@/lib/utils';
import type {
  Feedback,
  FeedbackListResponse,
  FeedbackFilters,
  SubmitFeedbackRequest,
} from '@/types/api';
import { toast } from 'sonner';

export function useFeedbackList(projectId: string, filters: FeedbackFilters = {}) {
  return useQuery<FeedbackListResponse>({
    queryKey: queryKeys.feedback.list(projectId, filters),
    queryFn: async () => {
      const res = await api.get<FeedbackListResponse>(
        `/api/v1/projects/${projectId}/feedback`,
        { params: filters }
      );
      return res.data;
    },
    staleTime: 10_000,
    enabled: !!projectId,
  });
}

export function useFeedbackDetail(id: string) {
  return useQuery<Feedback>({
    queryKey: queryKeys.feedback.detail(id),
    queryFn: async () => {
      const res = await api.get<{ data: Feedback }>(`/api/v1/feedback/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useSubmitFeedback(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<Feedback, Error, SubmitFeedbackRequest>({
    mutationFn: async (body) => {
      const res = await api.post<{ data: Feedback }>('/api/v1/feedback/submit', body);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feedback.list(projectId, {}) });
      queryClient.invalidateQueries({ queryKey: queryKeys.analysis.report(projectId) });
      toast.success('Feedback analyzed successfully');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
