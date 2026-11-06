"use client";

import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useWishlist } from "@/features/products/hooks/useWishlist";

export function WishlistButton({ productId }: { productId: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const { items, add, remove } = useWishlist(user?.uid ?? null);

  const existing = items.find((i) => i.productId === productId);

  const handleClick = () => {
    if (!user) {
      router.push(`/login?redirectTo=/marketplace/${productId}`);
      return;
    }
    if (existing) {
      remove(existing.id);
    } else {
      add(productId);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-neutral-900"
    >
      <Heart className={`h-4 w-4 ${existing ? "fill-current" : ""}`} />
      {existing ? "Saved to wishlist" : "Save to wishlist"}
    </button>
  );
}
