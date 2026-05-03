'use client';

import { useAlerts, useResolveAlert } from '@/hooks/useAlerts';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import type { AlertSeverity } from '@/types/api';

const SEVERITY_STYLES: Record<AlertSeverity, string> = {
  low: 'bg-blue-50 border-blue-200',
  medium: 'bg-yellow-50 border-yellow-200',
  high: 'bg-orange-50 border-orange-200',
  critical: 'bg-red-50 border-red-200',
};

const SEVERITY_BADGE: Record<AlertSeverity, string> = {
  low: 'bg-blue-100 text-blue-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

export default function AlertsPage() {
  const { data: alerts, isLoading } = useAlerts();
  const resolve = useResolveAlert();

  const unresolved = alerts?.filter((a) => !a.isResolved) ?? [];
  const resolved = alerts?.filter((a) => a.isResolved) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#1A3C5E]">Alerts</h1>
        <p className="text-sm text-[#64748B] mt-0.5">
          {unresolved.length > 0
            ? `${unresolved.length} active alert${unresolved.length !== 1 ? 's' : ''} require your attention`
            : 'All alerts resolved'}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : !alerts || alerts.length === 0 ? (
        <EmptyState
          title="No alerts yet"
          description="Alerts are triggered when negative sentiment spikes or thresholds are exceeded."
        />
      ) : (
        <>
          {unresolved.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-[#1E293B]">Active</h2>
              {unresolved.map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-xl border p-4 ${SEVERITY_STYLES[alert.severity]}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <AlertTriangle className="h-4 w-4 text-[#F59E0B] shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-[#1E293B]">{alert.title}</p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              SEVERITY_BADGE[alert.severity]
                            }`}
                          >
                            {alert.severity}
                          </span>
                          {alert.project && (
                            <span className="text-xs text-[#64748B]">{alert.project.name}</span>
                          )}
                        </div>
                        <p className="text-sm text-[#475569] mt-0.5">{alert.message}</p>
                        {alert.triggerContext && (
                          <p className="text-xs text-[#94A3B8] mt-1 italic">
                            {alert.triggerContext}
                          </p>
                        )}
                        <div className="flex items-center gap-1 mt-2 text-xs text-[#94A3B8]">
                          <Clock className="h-3 w-3" />
                          {new Date(alert.createdAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 text-xs"
                      disabled={resolve.isPending}
                      onClick={() => resolve.mutate(alert.id)}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      Resolve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {resolved.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-[#94A3B8]">Resolved</h2>
              {resolved.map((alert) => (
                <div
                  key={alert.id}
                  className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 opacity-70"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-[#475569]">{alert.title}</p>
                        {alert.project && (
                          <span className="text-xs text-[#94A3B8]">{alert.project.name}</span>
                        )}
                      </div>
                      <p className="text-xs text-[#94A3B8] mt-0.5">{alert.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
