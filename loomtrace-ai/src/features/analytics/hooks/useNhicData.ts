"use client";

import { useQuery } from "@tanstack/react-query";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

interface RollupDoc {
  id: string;
  period: string;
  orderVolume?: number;
  activeWeavers?: number;
  scanCount?: number;
}

interface AlertDoc {
  id: string;
  type: string;
  severity: "low" | "medium" | "high";
  status: "open" | "resolved";
  clusterId?: string;
  summary: string;
  createdAt?: { toDate: () => Date };
}

// Reads analyticsRollups — written only by the nightly Cloud Function
// (Phase 1 Rev 2 §5/§7). Returns [] until that pipeline exists/has run;
// the page below renders an honest empty state for that case rather
// than fabricating numbers.
export function useClusterRollups() {
  return useQuery({
    queryKey: ["nhic-rollups"],
    queryFn: async (): Promise<RollupDoc[]> => {
      const snap = await getDocs(query(collection(db, "analyticsRollups"), orderBy("period", "desc"), limit(12)));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as RollupDoc);
    },
  });
}

export function useInterventionAlerts() {
  return useQuery({
    queryKey: ["nhic-alerts"],
    queryFn: async (): Promise<AlertDoc[]> => {
      const snap = await getDocs(
        query(collection(db, "interventionAlerts"), orderBy("createdAt", "desc"), limit(20))
      );
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AlertDoc);
    },
  });
}
