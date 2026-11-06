"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { typedConverter } from "@/lib/firebase/converters";
import type { UserProfile, UserRole } from "@/types/models";

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: async (): Promise<UserProfile[]> => {
      const snap = await getDocs(
        query(collection(db, "users").withConverter(typedConverter<UserProfile>()), orderBy("createdAt", "desc"), limit(100))
      );
      return snap.docs.map((d) => d.data());
    },
  });
}

export function useSetUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ targetUid, role }: { targetUid: string; role: UserRole }) => {
      // Goes through the admin-gated Route Handler (see
      // app/api/auth/set-role/route.ts), never a direct Firestore write —
      // custom claims can only be set server-side with the Admin SDK.
      const res = await fetch("/api/auth/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUid, role }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Could not update role.");
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });
}
