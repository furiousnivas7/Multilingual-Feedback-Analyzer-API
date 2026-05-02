'use client';

import { Menu, Bell } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { Button } from '@/components/ui/button';
import { useAlerts } from '@/hooks/useAlerts';
import Link from 'next/link';

interface TopbarProps {
  title?: string;
}

export function Topbar({ title }: TopbarProps) {
  const { toggleSidebar } = useAppStore();
  const { data: alerts } = useAlerts();
  const unresolved = alerts?.filter((a) => !a.isResolved).length ?? 0;

  return (
    <header className="flex items-center justify-between h-14 px-4 border-b border-[#E2E8F0] bg-white">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        {title && (
          <h1 className="text-base font-semibold text-[#1E293B]">{title}</h1>
        )}
      </div>

      <Link href="/alerts">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-[#64748B]" />
          {unresolved > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-medium">
              {unresolved > 9 ? '9+' : unresolved}
            </span>
          )}
        </Button>
      </Link>
    </header>
  );
}
