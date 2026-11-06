"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { typedConverter } from "@/lib/firebase/converters";
import type { Product, ProductStatus } from "@/types/models";

const PAGE_SIZE = 12;

export type ProductSortField = "createdAt" | "title" | "priceRange.min";

interface UseInfiniteWeaverProductsArgs {
  weaverId: string | null;
  statusFilter: ProductStatus | "all";
  sortField: ProductSortField;
  sortDirection: "asc" | "desc";
}

/**
 * Server-side status filter + sort (cheap, scales — real Firestore
 * queries, not client-side array filtering of an unbounded dataset).
 * Free-text search is intentionally layered on top client-side over the
 * currently loaded page in the UI component, since full-text search
 * needs a real search index (Algolia/Typesense/Elasticsearch) that's
 * out of scope for this phase — noted here rather than faked as a
 * server capability it doesn't have.
 */
export function useInfiniteWeaverProducts({
  weaverId,
  statusFilter,
  sortField,
  sortDirection,
}: UseInfiniteWeaverProductsArgs) {
  return useInfiniteQuery({
    queryKey: ["weaver-products-infinite", weaverId, statusFilter, sortField, sortDirection],
    queryFn: async ({ pageParam }: { pageParam: QueryDocumentSnapshot | null }) => {
      if (!weaverId) return { items: [] as Product[], cursor: null as QueryDocumentSnapshot | null };

      const constraints = [where("weaverId", "==", weaverId)];
      if (statusFilter !== "all") constraints.push(where("status", "==", statusFilter));

      const baseQuery = query(
        collection(db, "products").withConverter(typedConverter<Product>()),
        ...constraints,
        orderBy(sortField, sortDirection),
        ...(pageParam ? [startAfter(pageParam)] : []),
        limit(PAGE_SIZE)
      );

      const snapshot = await getDocs(baseQuery);
      return {
        items: snapshot.docs.map((d) => d.data()),
        cursor: snapshot.docs.length === PAGE_SIZE ? snapshot.docs[snapshot.docs.length - 1] : null,
      };
    },
    initialPageParam: null as QueryDocumentSnapshot | null,
    getNextPageParam: (lastPage) => lastPage.cursor,
    enabled: !!weaverId,
  });
}
