"use client";

import Link from "next/link";
import { Package, Fingerprint, ShieldCheck, ScanLine, Plus } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useWeaverProducts } from "@/features/products/hooks/useWeaverProducts";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatCardSkeleton, ProductCardSkeleton } from "@/components/dashboard/Skeletons";
import { EmptyState } from "@/components/dashboard/EmptyState";
import Image from "next/image";

export default function WeaverOverviewPage() {
  const { user } = useAuth();
  const { data: products, isLoading } = useWeaverProducts(user?.uid ?? null);

  const publishedCount = products?.filter((p) => p.status === "published").length ?? 0;
  const draftCount = products?.filter((p) => p.status === "draft").length ?? 0;
  const verifiedCount = products?.filter((p) => !!p.dpiId).length ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Welcome back{user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}</h1>
          <p className="mt-1 text-sm text-neutral-500">Here&apos;s how your products are doing.</p>
        </div>
        <Link
          href="/weaver/products/new"
          className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white shadow-soft hover:opacity-90 dark:bg-white dark:text-neutral-900"
        >
          <Plus className="h-4 w-4" />
          Add product
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Published products" value={String(publishedCount)} icon={Package} />
            <StatCard label="Drafts in progress" value={String(draftCount)} icon={Package} />
            <StatCard label="With Digital Identity" value={String(verifiedCount)} icon={Fingerprint} />
            <StatCard label="QR scans (30d)" value="—" icon={ScanLine} />
          </>
        )}
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Recent products</h2>
          <Link href="/weaver/products" className="text-sm font-medium text-accent-600 hover:underline">
            View all
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : !products || products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700">
            <EmptyState
              icon={ShieldCheck}
              title="Add your first product"
              description="Once you add a product, you can generate its Digital Product Identity and start reaching verified buyers."
              actionLabel="Add product"
              actionHref="/weaver/products/new"
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.slice(0, 4).map((product) => (
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
                <p className="text-xs capitalize text-neutral-500">{product.status}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
