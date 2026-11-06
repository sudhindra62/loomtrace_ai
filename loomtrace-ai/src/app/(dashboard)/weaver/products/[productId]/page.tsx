"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Package, ShieldCheck, Fingerprint, ExternalLink } from "lucide-react";
import { useProduct, useSetProductStatus } from "@/features/products/hooks/useProduct";
import { useCreateDpi } from "@/features/products/hooks/useProductMutations";
import { EmptyState } from "@/components/dashboard/EmptyState";

export default function WeaverProductDetailPage() {
  const params = useParams<{ productId: string }>();
  const router = useRouter();
  const { data: product, isLoading } = useProduct(params.productId);
  const setStatus = useSetProductStatus(params.productId);
  const createDpi = useCreateDpi();

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-900" />;
  }

  if (!product) {
    return (
      <EmptyState icon={Package} title="Product not found" description="This product may have been removed." />
    );
  }

  const handlePublishToggle = () => {
    setStatus.mutate(product.status === "published" ? "archived" : "published");
  };

  const handleCreateDpi = async () => {
    await createDpi.mutateAsync({ productId: params.productId });
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="grid gap-6 sm:grid-cols-[200px_1fr]">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
          {product.images?.[0] && <Image src={product.images[0]} alt={product.title} fill className="object-cover" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl font-semibold">{product.title}</h1>
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium capitalize text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
              {product.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-500">
            {product.category} · {product.craftType}
          </p>
          {product.priceRange && (
            <p className="mt-2 text-sm font-medium">
              ₹{product.priceRange.min.toLocaleString("en-IN")} – ₹{product.priceRange.max.toLocaleString("en-IN")}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={handlePublishToggle}
              disabled={setStatus.isPending || !product.dpiId}
              title={!product.dpiId ? "Create a Digital Product Identity before publishing" : undefined}
              className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-white dark:text-neutral-900"
            >
              {product.status === "published" ? "Unpublish" : "Publish"}
            </button>
            {product.status === "published" && (
              <a
                href={`/marketplace/${product.id}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900"
              >
                View live
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center gap-2">
          <Fingerprint className="h-4 w-4 text-accent-600" />
          <h2 className="text-sm font-semibold">Digital Product Identity</h2>
        </div>

        {product.dpiId ? (
          <div className="mt-3 flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
            <ShieldCheck className="h-4 w-4" />
            Identity issued — QR code active and scannable.
          </div>
        ) : (
          <div className="mt-3">
            <p className="text-sm text-neutral-500">
              This product doesn&apos;t have a Digital Product Identity yet. Publishing requires one.
            </p>
            <button
              onClick={handleCreateDpi}
              disabled={createDpi.isPending}
              className="mt-3 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-900"
            >
              {createDpi.isPending ? "Creating…" : "Create Digital Product Identity"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
