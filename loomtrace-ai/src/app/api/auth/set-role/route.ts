/**
 * POST /api/auth/set-role
 *
 * The ONLY way a user can be granted the 'government' or 'admin' role.
 * Public registration (see register/page.tsx + auth.schema.ts) can only
 * ever produce 'weaver' or 'buyer'. This route is itself admin-gated,
 * so privilege escalation requires an already-trusted admin to act.
 *
 * Every call is written to auditLogs — role changes are exactly the kind
 * of action a government platform must be able to answer "who granted
 * this, and when" about, indefinitely.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb, setUserRoleClaim, type UserRole } from "@/lib/firebase/admin";
import { getVerifiedSession } from "@/lib/firebase/session";
import { FieldValue } from "firebase-admin/firestore";

const setRoleSchema = z.object({
  targetUid: z.string().min(1),
  role: z.enum(["weaver", "buyer", "government", "admin"]),
});

export async function POST(request: NextRequest) {
  const session = await getVerifiedSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json(
      { error: { code: "forbidden", message: "Admin role required." } },
      { status: 403 }
    );
  }

  const parsed = setRoleSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "validation_error", message: parsed.error.issues[0]?.message ?? "Invalid input" } },
      { status: 400 }
    );
  }

  const { targetUid, role } = parsed.data;

  try {
    await setUserRoleClaim(targetUid, role as UserRole);

    // Keep Firestore's users/{uid}.role field in sync for query/display
    // convenience ONLY — this field is explicitly NOT the security
    // boundary (custom claims are, per Rev 2 §8). Firestore rules never
    // trust this field for authorization decisions.
    await adminDb.collection("users").doc(targetUid).set({ role }, { merge: true });

    await adminDb.collection("auditLogs").add({
      actorId: session.uid,
      action: "role_change",
      targetType: "user",
      targetId: targetUid,
      metadata: { newRole: role },
      timestamp: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("[auth/set-role] failed", err);
    return NextResponse.json(
      { error: { code: "role_update_failed", message: "Could not update role." } },
      { status: 500 }
    );
  }
}
