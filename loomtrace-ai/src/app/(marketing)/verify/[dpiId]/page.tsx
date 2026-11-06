import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { ShieldCheck, ShieldAlert, CheckCircle2, ScanLine } from "lucide-react";
import { adminDb } from "@/lib/firebase/admin";
import { verifyDpiToken } from "@/lib/qr/signing";
import { checkRateLimit } from "@/lib/security/rateLimit";
import { headers } from "next/headers";
import { FieldValue } from "firebase-admin/firestore";

// Forces this to re-run on every request rather than being statically
// cached — a scan-logging page cannot be a cached static page by
// definition (Phase 1 Rev 2: every scan is a real event).
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ dpiId: string }>;
  searchParams: Promise<{ t?: string }>;
}

const LIFECYCLE_LABELS: Record<string, string> = {
  registered: "Registered",
  story_generated: "Heritage story generated",
  weaver_verified: "Weaver verified",
  authenticity_check: "Authenticity checked",
  buyer_review: "Buyer review received",
  exhibition: "Exhibited",
  award: "Award received",
  exported: "Exported",
  ownership_transfer: "Ownership transferred",
  government_recognition: "Government recognition",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { dpiId } = await params;
  return { title: `Verify Digital Product Identity · ${dpiId.slice(0, 8)}`, robots: { index: false } };
}

export default async function VerifyDpiPage({ params, searchParams }: PageProps) {
  const { dpiId } = await params;
  const { t } = await searchParams;

  if (!t || !verifyDpiToken(dpiId, t)) {
    return <InvalidTokenState />;
  }

  const requestHeaders = await headers();
  const clientIp = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed } = await checkRateLimit(`verify_scan:${clientIp}`, 30);
  if (!allowed) {
    return (
      <main id="main-content" className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
        <p className="text-sm text-neutral-500">Too many requests from this connection. Please try again shortly.</p>
      </main>
    );
  }

  const dpiSnap = await adminDb.collection("productIdentities").doc(dpiId).get();
  if (!dpiSnap.exists) notFound();
  const dpi = dpiSnap.data()!;

  const [productSnap, eventsSnap] = await Promise.all([
    adminDb.collection("products").doc(dpi.productId).get(),
    adminDb
      .collection("productIdentities")
      .doc(dpiId)
      .collection("lifecycleEvents")
      .orderBy("timestamp", "asc")
      .get(),
  ]);
  const product = productSnap.exists ? productSnap.data()! : null;
  const events = eventsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // Log the scan — anonymous, no PII beyond what the request itself
  // carries, per firestore.rules (`allow create: if true` on qrScans).
  await adminDb.collection("qrScans").add({
    dpiId,
    scannedAt: FieldValue.serverTimestamp(),
  });
  await dpiSnap.ref.update({
    scanCount: FieldValue.increment(1),
    lastScanAt: FieldValue.serverTimestamp(),
  });

  const isVerified = dpi.verification?.status === "verified";

  return (
    <main id="main-content" className="mx-auto max-w-2xl px-6 py-16">
      <div className="flex items-center gap-2 text-sm text-neutral-500">
        <ScanLine className="h-4 w-4" />
        Digital Product Identity · Public Verification
      </div>

      <div className="mt-6 flex items-start justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold tracking-tight">{product?.title ?? "Handloom Product"}</h1>
        <span
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
            isVerified
              ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
              : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
          }`}
        >
          {isVerified ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
          {isVerified ? "Verified" : "Pending human verification"}
        </span>
      </div>

      {product?.images?.[0] && (
        <div className="relative mt-6 aspect-video overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-900">
          <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
        </div>
      )}

      <p className="mt-6 text-sm text-neutral-500">
        This page reflects the complete, tamper-evident history of this product as recorded by LoomTrace AI. AI-assisted
        analysis supports, but does not replace, the human verification shown above.
      </p>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold">Lifecycle</h2>
        <ol className="relative mt-4 space-y-6 border-l border-neutral-200 pl-6 dark:border-neutral-800">
          {events.map((event) => (
            <li key={event.id} className="relative">
              <span className="absolute -left-[calc(1.5rem+5px)] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent-500 text-white">
                <CheckCircle2 className="h-3 w-3" />
              </span>
              <p className="text-sm font-medium">{LIFECYCLE_LABELS[event.type] ?? event.type}</p>
              <p className="text-xs text-neutral-400">
                {event.timestamp?.toDate ? event.timestamp.toDate().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) : ""}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-10 text-center text-xs text-neutral-400">
        Scanned {dpi.scanCount + 1} time{dpi.scanCount + 1 === 1 ? "" : "s"} · A LoomTrace AI verification record
      </p>
    </main>
  );
}

function InvalidTokenState() {
  return (
    <main id="main-content" className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <ShieldAlert className="h-10 w-10 text-red-500" />
      <h1 className="mt-4 font-display text-xl font-semibold">Invalid or tampered verification link</h1>
      <p className="mt-2 text-sm text-neutral-500">
        This QR code&apos;s verification link could not be validated. If you scanned a printed QR code directly,
        try again — if this persists, the product may not be genuinely registered on LoomTrace AI.
      </p>
    </main>
  );
}
