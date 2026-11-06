"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, X, Package } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useWishlist } from "@/features/products/hooks/useWishlist";
import { ProductCardSkeleton } from "@/components/dashboard/Skeletons";
import { EmptyState } from "@/components/dashboard/EmptyState";

export default function WishlistPage() {
  const { user } = useAuth();
  const { items, isLoading, remove } = useWishlist(user?.uid ?? null);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Wishlist</h1>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700">
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Save products you're considering while you browse the marketplace — they'll show up here."
            actionLabel="Explore marketplace"
            actionHref="/marketplace"
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-2xl border border-neutral-200 bg-white p-3 shadow-soft dark:border-neutral-800 dark:bg-neutral-900"
            >
              <button
                aria-label="Remove from wishlist"
                onClick={() => remove(item.id)}
                className="absolute right-4 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-neutral-500 shadow-soft hover:text-red-600 dark:bg-neutral-800/90"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <Link href={item.product ? (`/marketplace/${item.product.id}` as never) : "#"}>
                <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
                  {item.product?.images?.[0] ? (
                    <Image src={item.product.images[0]} alt={item.product.title} fill sizes="200px" className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-neutral-300">
                      <Package className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <p className="mt-2.5 truncate text-sm font-medium">{item.product?.title ?? "Product unavailable"}</p>
                {item.product?.priceRange && (
                  <p className="text-xs text-neutral-500">
                    ₹{item.product.priceRange.min.toLocaleString("en-IN")} – ₹
                    {item.product.priceRange.max.toLocaleString("en-IN")}
                  </p>
                )}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
