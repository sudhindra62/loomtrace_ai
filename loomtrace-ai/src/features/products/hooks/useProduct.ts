"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { typedConverter } from "@/lib/firebase/converters";
import type { Product, ProductStatus } from "@/types/models";

export function useProduct(productId: string | null) {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: async (): Promise<Product | null> => {
      if (!productId) return null;
      const snap = await getDoc(doc(db, "products", productId).withConverter(typedConverter<Product>()));
      return snap.exists() ? snap.data() : null;
    },
    enabled: !!productId,
  });
}

export function useSetProductStatus(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (status: ProductStatus) => {
      await updateDoc(doc(db, "products", productId), { status, updatedAt: serverTimestamp() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      queryClient.invalidateQueries({ queryKey: ["weaver-products-infinite"] });
    },
  });
}
