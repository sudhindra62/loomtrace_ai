"use client";

import { Users, ScrollText, ShieldAlert } from "lucide-react";
import { useAdminUsers } from "@/features/admin/hooks/useAdminUsers";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatCardSkeleton } from "@/components/dashboard/Skeletons";

export default function AdminOverviewPage() {
  const { data: users, isLoading } = useAdminUsers();
  const suspended = users?.filter((u) => u.status === "suspended").length ?? 0;

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Admin Overview</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Total users" value={String(users?.length ?? 0)} icon={Users} />
            <StatCard label="Suspended accounts" value={String(suspended)} icon={ShieldAlert} />
            <StatCard label="Audit events (24h)" value="—" icon={ScrollText} />
          </>
        )}
      </div>
    </div>
  );
}
