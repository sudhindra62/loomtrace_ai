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
import type { Product } from "@/types/models";

const PAGE_SIZE = 12;

export function useMarketplaceProducts(categoryFilter: string | "all") {
  return useInfiniteQuery({
    queryKey: ["marketplace-products", categoryFilter],
    queryFn: async ({ pageParam }: { pageParam: QueryDocumentSnapshot | null }) => {
      const constraints = [where("status", "==", "published")];
      if (categoryFilter !== "all") constraints.push(where("category", "==", categoryFilter));

      const q = query(
        collection(db, "products").withConverter(typedConverter<Product>()),
        ...constraints,
        orderBy("createdAt", "desc"),
        ...(pageParam ? [startAfter(pageParam)] : []),
        limit(PAGE_SIZE)
      );
      const snapshot = await getDocs(q);
      return {
        items: snapshot.docs.map((d) => d.data()),
        cursor: snapshot.docs.length === PAGE_SIZE ? snapshot.docs[snapshot.docs.length - 1] : null,
      };
    },
    initialPageParam: null as QueryDocumentSnapshot | null,
    getNextPageParam: (lastPage) => lastPage.cursor,
  });
}
