import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getVerifiedSession } from "@/lib/firebase/session";
import { adminDb } from "@/lib/firebase/admin";
import { appendLifecycleEvent } from "@/lib/events/appendLifecycleEvent";
import { generateAndStoreQrForDpi } from "@/lib/qr/generateAndStoreQr";
import { FieldValue } from "firebase-admin/firestore";

const requestSchema = z.object({ productId: z.string().min(1) });

/**
 * Creates a product's Digital Product Identity (Phase 1 Rev 2 §2):
 * a snapshot document + its genesis lifecycle event (hash-chained), then
 * issues the signed, publicly-scannable QR. This is the single write
 * path for DPI creation — the weaver dashboard calls this, nothing
 * writes to productIdentities directly from the client.
 */
export async function POST(request: NextRequest) {
  const session = await getVerifiedSession();
  if (!session || session.role !== "weaver") {
    return NextResponse.json({ error: { code: "forbidden", message: "Weaver role required." } }, { status: 403 });
  }

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "validation_error", message: "Invalid input" } }, { status: 400 });
  }

  const productRef = adminDb.collection("products").doc(parsed.data.productId);
  const productSnap = await productRef.get();

  if (!productSnap.exists) {
    return NextResponse.json({ error: { code: "not_found", message: "Product not found." } }, { status: 404 });
  }
  const product = productSnap.data()!;
  if (product.weaverId !== session.uid) {
    return NextResponse.json({ error: { code: "forbidden", message: "You do not own this product." } }, { status: 403 });
  }
  if (product.dpiId) {
    return NextResponse.json({ error: { code: "already_exists", message: "This product already has a Digital Product Identity." } }, { status: 409 });
  }

  try {
    // dpiId shares the product's ID for simplicity and traceability —
    // a product and its identity are created together and 1:1 for the
    // product's lifetime (resale is modeled via ownershipTransfer events
    // on the same DPI, per Phase 1 Rev 2 §7, not a new DPI).
    const dpiId = parsed.data.productId;
    const dpiRef = adminDb.collection("productIdentities").doc(dpiId);

    await dpiRef.set({
      productId: parsed.data.productId,
      weaverId: session.uid,
      clusterId: product.clusterId,
      status: "active",
      verification: { status: "pending", lastVerifiedAt: null, verificationEngineScore: null },
      sustainability: { score: null, certifications: [] },
      recognitions: { awards: [], exhibitions: [], exportHistory: [] },
      scanCount: 0,
      lastScanAt: null,
      qrIdentity: null, // populated below
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    await appendLifecycleEvent({
      collectionPath: `productIdentities/${dpiId}/lifecycleEvents`,
      type: "registered",
      payload: { productTitle: product.title, craftType: product.craftType },
      actorId: session.uid,
      actorRole: "weaver",
    });

    const { qrCodeUrl, verificationUrl } = await generateAndStoreQrForDpi(dpiId);

    await dpiRef.update({
      qrIdentity: { qrCodeUrl, verificationUrl },
      updatedAt: FieldValue.serverTimestamp(),
    });

    await appendLifecycleEvent({
      collectionPath: `productIdentities/${dpiId}/lifecycleEvents`,
      type: "story_generated",
      payload: { note: "QR identity issued" },
      actorId: session.uid,
      actorRole: "weaver",
    });

    await productRef.update({ dpiId, updatedAt: FieldValue.serverTimestamp() });

    await adminDb.collection("auditLogs").add({
      actorId: session.uid,
      action: "dpi_created",
      targetType: "productIdentity",
      targetId: dpiId,
      metadata: {},
      timestamp: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ dpiId, qrCodeUrl, verificationUrl });
  } catch (err) {
    console.error("[dpi/create] failed", err);
    return NextResponse.json(
      { error: { code: "dpi_creation_failed", message: "Could not create Digital Product Identity." } },
      { status: 500 }
    );
  }
}
