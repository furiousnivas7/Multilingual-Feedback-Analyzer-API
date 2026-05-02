'use client';

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { getErrorMessage } from '@/lib/utils';
import type { BatchJob } from '@/types/api';
import { toast } from 'sonner';

const TERMINAL = ['completed', 'failed', 'partial'];

export function useBatchJob(jobId: string) {
  return useQuery<BatchJob>({
    queryKey: queryKeys.batchJobs.detail(jobId),
    queryFn: async () => {
      const res = await api.get<{ data: BatchJob }>(`/api/v1/batch/${jobId}`);
      return res.data.data;
    },
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && TERMINAL.includes(status) ? false : 2000;
    },
    enabled: !!jobId,
  });
}

export function useBatchJobList(projectId: string) {
  return useQuery<BatchJob[]>({
    queryKey: queryKeys.batchJobs.list(projectId),
    queryFn: async () => {
      const res = await api.get<{ data: BatchJob[] }>(
        `/api/v1/batch?projectId=${projectId}`
      );
      return res.data.data;
    },
    enabled: !!projectId,
  });
}

export function useUploadFile(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<BatchJob, Error, FormData>({
    mutationFn: async (formData) => {
      const res = await api.post<{ data: BatchJob }>(
        `/api/v1/feedback/upload`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.batchJobs.list(projectId) });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
