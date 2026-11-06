"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, ShieldCheck } from "lucide-react";
import { useMarketplaceProducts } from "@/features/products/hooks/useMarketplaceProducts";
import { ProductCardSkeleton } from "@/components/dashboard/Skeletons";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { useInView } from "@/hooks/useInView";

const CATEGORIES = ["all", "Saree", "Stole", "Fabric (by metre)", "Dupatta", "Home furnishing"];

export default function MarketplacePage() {
  const [category, setCategory] = useState<string>("all");
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useMarketplaceProducts(category);
  const { ref: sentinelRef, inView } = useInView<HTMLDivElement>({ rootMargin: "200px" });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const products = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-10">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Marketplace</h1>
        <p className="mt-2 text-neutral-500">Verified, authentic handloom products, directly from weavers.</p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              category === c
                ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                : "border-neutral-300 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-900"
            }`}
          >
            {c === "all" ? "All categories" : c}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700">
          <EmptyState
            icon={Package}
            title="No products published yet"
            description="As weavers publish verified products, they'll appear here for buyers and exporters to discover."
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/marketplace/${product.id}` as never}
                className="group rounded-2xl border border-neutral-200 bg-white p-3 shadow-soft transition-colors hover:border-accent-300 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
                  {product.images?.[0] ? (
                    <Image src={product.images[0]} alt={product.title} fill sizes="240px" className="object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-neutral-300">
                      <Package className="h-8 w-8" />
                    </div>
                  )}
                  {product.dpiId && (
                    <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium text-green-700 dark:bg-neutral-900/90 dark:text-green-400">
                      <ShieldCheck className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="mt-2.5 truncate text-sm font-medium">{product.title}</p>
                {product.priceRange && (
                  <p className="text-xs text-neutral-500">
                    ₹{product.priceRange.min.toLocaleString("en-IN")} – ₹{product.priceRange.max.toLocaleString("en-IN")}
                  </p>
                )}
              </Link>
            ))}
          </div>
          <div ref={sentinelRef} className="flex justify-center py-8">
            {isFetchingNextPage && <p className="text-sm text-neutral-400">Loading more…</p>}
          </div>
        </>
      )}
    </div>
  );
}
