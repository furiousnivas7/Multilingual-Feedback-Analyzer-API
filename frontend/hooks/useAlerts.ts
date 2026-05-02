'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { getErrorMessage } from '@/lib/utils';
import type { Alert } from '@/types/api';
import { toast } from 'sonner';

export function useAlerts() {
  return useQuery<Alert[]>({
    queryKey: queryKeys.alerts,
    queryFn: async () => {
      const res = await api.get<{ data: Alert[] }>('/api/v1/alerts');
      return res.data.data;
    },
  });
}

export function useResolveAlert() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.patch(`/api/v1/alerts/${id}/resolve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.alerts });
      toast.success('Alert resolved');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
