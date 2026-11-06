"use client";

import { useQuery } from "@tanstack/react-query";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { ScrollText } from "lucide-react";
import { db } from "@/lib/firebase/client";
import { typedConverter } from "@/lib/firebase/converters";
import { TableRowSkeleton } from "@/components/dashboard/Skeletons";
import { EmptyState } from "@/components/dashboard/EmptyState";
import type { AuditLogEntry } from "@/types/models";

function useAuditLogs() {
  return useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: async (): Promise<AuditLogEntry[]> => {
      const snap = await getDocs(
        query(collection(db, "auditLogs").withConverter(typedConverter<AuditLogEntry>()), orderBy("timestamp", "desc"), limit(100))
      );
      return snap.docs.map((d) => d.data());
    },
  });
}

export default function AuditLogsPage() {
  const { data: logs, isLoading } = useAuditLogs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Audit Logs</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Every admin action and system event, write-only, per Phase 1 Rev 3 §2 (security & resilience).
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} />)
        ) : !logs || logs.length === 0 ? (
          <div className="p-4">
            <EmptyState icon={ScrollText} title="No audit events yet" description="Actions like role changes and verifications will be logged here." compact />
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-center justify-between gap-4 border-b border-neutral-100 px-4 py-3 text-sm last:border-0 dark:border-neutral-800/60">
              <div>
                <p className="font-medium">{log.action.replace(/_/g, " ")}</p>
                <p className="text-xs text-neutral-500">
                  {log.targetType} · {log.targetId} · by {log.actorId}
                </p>
              </div>
              <span className="shrink-0 text-xs text-neutral-400">
                {log.timestamp ? formatDistanceToNow(log.timestamp.toDate(), { addSuffix: true }) : ""}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
