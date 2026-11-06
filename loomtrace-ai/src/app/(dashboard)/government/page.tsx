"use client";

import { LandPlot, Users, ScanLine, TriangleAlert } from "lucide-react";
import { useClusterRollups, useInterventionAlerts } from "@/features/analytics/hooks/useNhicData";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatCardSkeleton } from "@/components/dashboard/Skeletons";
import { AccessibleChart } from "@/components/dashboard/AccessibleChart";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { cn } from "@/lib/utils/cn";

const SEVERITY_STYLES: Record<string, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  low: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
};

export default function NhicOverviewPage() {
  const { data: rollups, isLoading: rollupsLoading } = useClusterRollups();
  const { data: alerts, isLoading: alertsLoading } = useInterventionAlerts();

  const orderVolumeSeries =
    rollups?.slice().reverse().map((r) => ({ label: r.period, value: r.orderVolume ?? 0 })) ?? [];
  const activeWeaverSeries =
    rollups?.slice().reverse().map((r) => ({ label: r.period, value: r.activeWeavers ?? 0 })) ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">National Handloom Intelligence Center</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Cluster health, demand trends, and AI-flagged interventions across mapped weaving clusters.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {rollupsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Mapped clusters" value="—" icon={LandPlot} />
            <StatCard label="Active weavers" value="—" icon={Users} />
            <StatCard label="QR scans (30d)" value="—" icon={ScanLine} />
            <StatCard
              label="Open alerts"
              value={String(alerts?.filter((a) => a.status === "open").length ?? 0)}
              icon={TriangleAlert}
            />
          </>
        )}
      </div>

      {rollupsLoading ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="h-72 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-900" />
          <div className="h-72 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-900" />
        </div>
      ) : orderVolumeSeries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700">
          <EmptyState
            icon={LandPlot}
            title="Analytics will appear once activity begins"
            description="This dashboard reads from nightly aggregation rollups (Phase 1 Rev 2 §5) — it populates automatically as weavers and buyers use the platform, no manual setup needed."
          />
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <AccessibleChart title="Order volume trend" data={orderVolumeSeries} valueLabel="Orders" type="line" />
          <AccessibleChart title="Active weavers" data={activeWeaverSeries} valueLabel="Weavers" type="bar" />
        </div>
      )}

      <section>
        <h2 className="mb-4 font-display text-lg font-semibold">Early Warning Alerts</h2>
        {alertsLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-900" />
            ))}
          </div>
        ) : !alerts || alerts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700">
            <EmptyState
              icon={TriangleAlert}
              title="No active alerts"
              description="The nightly Early Warning System (Phase 1 Rev 3 §5) will surface declining clusters, counterfeit hotspots, and growth opportunities here as conditions are detected."
              compact
            />
          </div>
        ) : (
          <ul className="space-y-2">
            {alerts.map((alert) => (
              <li
                key={alert.id}
                className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div>
                  <p className="text-sm font-medium">{alert.summary}</p>
                  <p className="text-xs text-neutral-500">{alert.type.replace(/_/g, " ")}</p>
                </div>
                <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium capitalize", SEVERITY_STYLES[alert.severity])}>
                  {alert.severity}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
