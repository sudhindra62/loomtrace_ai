import { NextRequest, NextResponse } from "next/server";
import { getVerifiedSession } from "@/lib/firebase/session";
import { adminDb } from "@/lib/firebase/admin";
import { productCreateSchema } from "@/lib/validation/ai.schema";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  const session = await getVerifiedSession();
  if (!session || session.role !== "weaver") {
    return NextResponse.json({ error: { code: "forbidden", message: "Weaver role required." } }, { status: 403 });
  }

  const parsed = productCreateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "validation_error", message: parsed.error.issues[0]?.message ?? "Invalid input" } },
      { status: 400 }
    );
  }

  const { priceMin, priceMax, images, clusterId, ...rest } = parsed.data;

  const docRef = await adminDb.collection("products").add({
    ...rest,
    weaverId: session.uid,
    clusterId,
    priceRange: { min: priceMin, max: priceMax },
    images,
    status: "draft",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  await adminDb.collection("auditLogs").add({
    actorId: session.uid,
    action: "product_created",
    targetType: "product",
    targetId: docRef.id,
    metadata: { title: parsed.data.title },
    timestamp: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ productId: docRef.id });
}
