"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { useAdminUsers, useSetUserRole } from "@/features/admin/hooks/useAdminUsers";
import { TableRowSkeleton } from "@/components/dashboard/Skeletons";
import { EmptyState } from "@/components/dashboard/EmptyState";
import type { UserRole } from "@/types/models";

const ROLE_OPTIONS: UserRole[] = ["weaver", "buyer", "government", "admin"];

export default function AdminUsersPage() {
  const { data: users, isLoading } = useAdminUsers();
  const setRole = useSetUserRole();
  const [pendingUid, setPendingUid] = useState<string | null>(null);

  const handleRoleChange = async (uid: string, role: UserRole) => {
    setPendingUid(uid);
    try {
      await setRole.mutateAsync({ targetUid: uid, role });
    } finally {
      setPendingUid(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Role changes here are audit-logged and take effect immediately via server-verified custom claims.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-4 border-b border-neutral-200 bg-neutral-50 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/60">
          <span className="w-1/3">Name</span>
          <span className="w-1/4">Email</span>
          <span className="w-1/6">Status</span>
          <span className="w-1/4">Role</span>
        </div>

        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} />)
        ) : !users || users.length === 0 ? (
          <div className="p-4">
            <EmptyState icon={Users} title="No users yet" description="Registered users will appear here." compact />
          </div>
        ) : (
          users.map((u) => (
            <div key={u.uid} className="flex items-center gap-4 border-b border-neutral-100 px-4 py-3 text-sm last:border-0 dark:border-neutral-800/60">
              <span className="w-1/3 truncate font-medium">{u.fullName}</span>
              <span className="w-1/4 truncate text-neutral-500">{u.email}</span>
              <span className="w-1/6">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    u.status === "active"
                      ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                      : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                  }`}
                >
                  {u.status}
                </span>
              </span>
              <span className="w-1/4">
                <select
                  value={u.role}
                  disabled={pendingUid === u.uid}
                  onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole)}
                  className="rounded-lg border border-neutral-300 px-2 py-1 text-xs disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900"
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
