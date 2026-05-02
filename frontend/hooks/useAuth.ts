'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { setToken, clearToken } from '@/lib/auth';
import { useAppStore } from '@/store/appStore';
import { queryKeys } from '@/lib/queryKeys';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '@/types/api';

export function useCurrentUser() {
  return useQuery<User>({
    queryKey: queryKeys.user,
    queryFn: async () => {
      const res = await api.get<{ data: User }>('/api/v1/auth/me');
      return res.data.data;
    },
    retry: false,
  });
}

export function useLogin() {
  const router = useRouter();
  const setUser = useAppStore((s) => s.setUser);

  return useMutation<AuthResponse, Error, LoginRequest & { remember?: boolean }>({
    mutationFn: async ({ remember: _r, ...body }) => {
      const res = await api.post<AuthResponse>('/api/v1/auth/login', body);
      return res.data;
    },
    onSuccess: (data, vars) => {
      setToken(data.token, vars.remember);
      setUser(data.user);
      router.push('/');
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const setUser = useAppStore((s) => s.setUser);

  return useMutation<AuthResponse, Error, RegisterRequest>({
    mutationFn: async (body) => {
      const res = await api.post<AuthResponse>('/api/v1/auth/register', body);
      return res.data;
    },
    onSuccess: (data) => {
      setToken(data.token);
      setUser(data.user);
      router.push('/');
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const setUser = useAppStore((s) => s.setUser);
  const queryClient = useQueryClient();

  return () => {
    clearToken();
    setUser(null);
    queryClient.clear();
    router.push('/login');
  };
}
