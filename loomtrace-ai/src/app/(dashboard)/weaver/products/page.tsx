"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Plus, Package } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  useInfiniteWeaverProducts,
  type ProductSortField,
} from "@/features/products/hooks/useInfiniteWeaverProducts";
import { ProductCardSkeleton } from "@/components/dashboard/Skeletons";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { useInView } from "@/hooks/useInView";
import type { ProductStatus } from "@/types/models";

const SORT_OPTIONS: { value: ProductSortField; label: string }[] = [
  { value: "createdAt", label: "Newest first" },
  { value: "title", label: "Title (A–Z)" },
  { value: "priceRange.min", label: "Price (low to high)" },
];

export default function WeaverProductsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "all">("all");
  const [sortField, setSortField] = useState<ProductSortField>("createdAt");

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteWeaverProducts({
    weaverId: user?.uid ?? null,
    statusFilter,
    sortField,
    sortDirection: sortField === "priceRange.min" ? "asc" : sortField === "title" ? "asc" : "desc",
  });

  const { ref: sentinelRef, inView } = useInView<HTMLDivElement>({ rootMargin: "200px" });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allProducts = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);

  // Client-side text search over loaded results — see the honesty note
  // in useInfiniteWeaverProducts.ts about why full-text search isn't a
  // server-side capability yet.
  const filteredProducts = useMemo(() => {
    if (!search.trim()) return allProducts;
    const term = search.trim().toLowerCase();
    return allProducts.filter(
      (p) => p.title.toLowerCase().includes(term) || p.category.toLowerCase().includes(term)
    );
  }, [allProducts, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Products</h1>
        <Link
          href="/weaver/products/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white shadow-soft hover:opacity-90 dark:bg-white dark:text-neutral-900"
        >
          <Plus className="h-4 w-4" />
          Add product
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your products…"
            className="w-full rounded-lg border border-neutral-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ProductStatus | "all")}
          className="rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-900"
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value as ProductSortField)}
          className="rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-900"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700">
          <EmptyState
            icon={Package}
            title={search ? "No products match your search" : "No products yet"}
            description={
              search
                ? "Try a different search term or clear your filters."
                : "Add your first handloom product to start building its Digital Product Identity."
            }
            actionLabel={search ? undefined : "Add product"}
            actionHref={search ? undefined : "/weaver/products/new"}
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/weaver/products/${product.id}` as never}
                className="group rounded-2xl border border-neutral-200 bg-white p-3 shadow-soft transition-colors hover:border-accent-300 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
                  {product.images?.[0] ? (
                    <Image src={product.images[0]} alt={product.title} fill sizes="200px" className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-neutral-300">
                      <Package className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <p className="mt-2.5 truncate text-sm font-medium">{product.title}</p>
                <div className="mt-0.5 flex items-center justify-between">
                  <p className="text-xs capitalize text-neutral-500">{product.status}</p>
                  {product.priceRange && (
                    <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                      ₹{product.priceRange.min.toLocaleString("en-IN")}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Infinite scroll sentinel — fetchNextPage fires when this
              scrolls into view, 200px before it's actually visible
              (rootMargin) so the next page is ready before the user hits
              the bottom. */}
          <div ref={sentinelRef} className="flex justify-center py-4">
            {isFetchingNextPage && <p className="text-sm text-neutral-400">Loading more…</p>}
          </div>
        </>
      )}
    </div>
  );
}
