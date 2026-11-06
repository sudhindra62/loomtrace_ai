"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Star, Compass } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useWishlist } from "@/features/products/hooks/useWishlist";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatCardSkeleton } from "@/components/dashboard/Skeletons";

export default function BuyerOverviewPage() {
  const { user } = useAuth();
  const { items: wishlistItems, isLoading } = useWishlist(user?.uid ?? null);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Welcome back{user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">Discover verified, authentic handloom products.</p>
        </div>
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white shadow-soft hover:opacity-90 dark:bg-white dark:text-neutral-900"
        >
          <Compass className="h-4 w-4" />
          Browse marketplace
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Wishlist items" value={String(wishlistItems.length)} icon={Heart} />
            <StatCard label="Orders placed" value="—" icon={ShoppingBag} />
            <StatCard label="Reviews written" value="—" icon={Star} />
          </>
        )}
      </div>
    </div>
  );
}
