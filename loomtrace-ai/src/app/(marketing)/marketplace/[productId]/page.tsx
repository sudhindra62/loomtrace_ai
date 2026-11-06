import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ShieldCheck, MapPin } from "lucide-react";
import { adminDb } from "@/lib/firebase/admin";
import { buildVerificationUrl } from "@/lib/qr/signing";
import { WishlistButton } from "@/components/marketplace/WishlistButton";

interface PageProps {
  params: Promise<{ productId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { productId } = await params;
  const snap = await adminDb.collection("products").doc(productId).get();
  const product = snap.data();
  return {
    title: product?.title ?? "Product",
    description: product?.aiGenerated?.description ?? "An authentic, verifiable Indian handloom product.",
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { productId } = await params;
  const snap = await adminDb.collection("products").doc(productId).get();
  if (!snap.exists) notFound();
  const product = snap.data()!;

  const verificationUrl = product.dpiId
    ? buildVerificationUrl(product.dpiId, process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
    : null;

  return (
    <main id="main-content" className="mx-auto max-w-5xl px-6 py-16">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-900">
          {product.images?.[0] && (
            <Image src={product.images[0]} alt={product.title} fill className="object-cover" priority />
          )}
        </div>

        <div>
          {product.dpiId && (
            <Link
              href={verificationUrl ?? "#"}
              className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-400"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Digital Product Identity verified — view full history
            </Link>
          )}

          <h1 className="font-display text-3xl font-semibold tracking-tight">{product.title}</h1>

          <div className="mt-2 flex items-center gap-1.5 text-sm text-neutral-500">
            <MapPin className="h-3.5 w-3.5" />
            {product.clusterId}
          </div>

          {product.priceRange && (
            <p className="mt-4 font-display text-2xl font-semibold">
              ₹{product.priceRange.min.toLocaleString("en-IN")} – ₹{product.priceRange.max.toLocaleString("en-IN")}
            </p>
          )}

          <p className="mt-6 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            {product.aiGenerated?.description ??
              `Handwoven ${product.craftType ?? "handloom"} product, made from ${(product.materials ?? []).join(", ") || "traditional materials"}.`}
          </p>

          {product.aiGenerated?.heritageStory && (
            <div className="mt-6 rounded-xl bg-neutral-50 p-4 text-sm text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-400">Heritage &amp; technique</p>
              {product.aiGenerated.heritageStory}
            </div>
          )}

          <div className="mt-8 flex gap-3">
            <WishlistButton productId={productId} />
            {product.dpiId && (
              <Link
                href={verificationUrl ?? "#"}
                className="rounded-lg border border-neutral-300 px-5 py-2.5 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900"
              >
                Verify authenticity
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
