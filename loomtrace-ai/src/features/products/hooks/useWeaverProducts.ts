"use client";

import { useQuery } from "@tanstack/react-query";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { typedConverter } from "@/lib/firebase/converters";
import type { Product } from "@/types/models";

/**
 * React Query wraps this (per Phase 1 §2: React Query for client reads,
 * onSnapshot reserved for genuinely live data like notifications). A
 * product list doesn't need millisecond-fresh updates, so a cached,
 * revalidate-on-focus-disabled query is the right, cheaper choice.
 */
export function useWeaverProducts(weaverId: string | null) {
  return useQuery({
    queryKey: ["weaver-products", weaverId],
    queryFn: async (): Promise<Product[]> => {
      if (!weaverId) return [];
      const q = query(
        collection(db, "products").withConverter(typedConverter<Product>()),
        where("weaverId", "==", weaverId),
        orderBy("createdAt", "desc"),
        limit(50)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => d.data());
    },
    enabled: !!weaverId,
  });
}
