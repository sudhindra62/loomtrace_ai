"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { collection, query, where, doc, deleteDoc, setDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { typedConverter } from "@/lib/firebase/converters";
import type { WishlistItem, Product } from "@/types/models";

interface WishlistEntry extends WishlistItem {
  product: Product | null;
}

export function useWishlist(buyerId: string | null) {
  const queryClient = useQueryClient();
  const queryKey = ["wishlist", buyerId];

  const wishlistQuery = useQuery({
    queryKey,
    queryFn: async (): Promise<WishlistEntry[]> => {
      if (!buyerId) return [];
      const wishlistSnap = await getDocs(
        query(
          collection(db, "wishlist").withConverter(typedConverter<WishlistItem>()),
          where("buyerId", "==", buyerId)
        )
      );
      const items = wishlistSnap.docs.map((d) => d.data());

      // Product docs fetched individually rather than a single 'in' query
      // beyond Firestore's 30-item 'in' limit — acceptable at wishlist
      // scale; would move to a batched approach if this list regularly
      // exceeded that.
      const withProducts = await Promise.all(
        items.map(async (item) => {
          const productSnap = await getDocs(
            query(collection(db, "products").withConverter(typedConverter<Product>()), where("__name__", "==", item.productId))
          );
          return { ...item, product: productSnap.docs[0]?.data() ?? null };
        })
      );
      return withProducts;
    },
    enabled: !!buyerId,
  });

  const removeMutation = useMutation({
    mutationFn: async (wishlistItemId: string) => {
      await deleteDoc(doc(db, "wishlist", wishlistItemId));
    },
    onMutate: async (wishlistItemId) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<WishlistEntry[]>(queryKey);
      queryClient.setQueryData<WishlistEntry[]>(queryKey, (old) =>
        old?.filter((item) => item.id !== wishlistItemId)
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      // Roll back the optimistic update on failure — this is what makes
      // "optimistic updates" safe rather than just "assume success."
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const addMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!buyerId) throw new Error("Not signed in");
      const id = `${buyerId}_${productId}`;
      await setDoc(doc(db, "wishlist", id), { buyerId, productId, createdAt: serverTimestamp() });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  return {
    items: wishlistQuery.data ?? [],
    isLoading: wishlistQuery.isLoading,
    remove: removeMutation.mutate,
    add: addMutation.mutate,
  };
}
