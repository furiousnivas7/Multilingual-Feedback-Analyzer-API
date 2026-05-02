'use client';

import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface DashboardShellProps {
  children: React.ReactNode;
  title?: string;
}

export function DashboardShell({ children, title }: DashboardShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F7FA]">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-[1280px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
