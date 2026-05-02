'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { getErrorMessage } from '@/lib/utils';
import type { Project, CreateProjectRequest } from '@/types/api';
import { toast } from 'sonner';

export function useProjects() {
  return useQuery<Project[]>({
    queryKey: queryKeys.projects.all,
    queryFn: async () => {
      const res = await api.get<{ data: Project[] }>('/api/v1/projects');
      return res.data.data;
    },
  });
}

export function useProject(id: string) {
  return useQuery<Project>({
    queryKey: queryKeys.projects.detail(id),
    queryFn: async () => {
      const res = await api.get<{ data: Project }>(`/api/v1/projects/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation<Project, Error, CreateProjectRequest>({
    mutationFn: async (body) => {
      const res = await api.post<{ data: Project }>('/api/v1/projects', body);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      toast.success('Project created');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
