'use client';

import { create } from 'zustand';
import type { User } from '@/types/api';

interface AppStore {
  user: User | null;
  setUser: (user: User | null) => void;
  activeProjectId: string | null;
  setActiveProject: (id: string | null) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  activeProjectId: null,
  setActiveProject: (id) => set({ activeProjectId: id }),
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
