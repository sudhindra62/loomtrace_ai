import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import { computeEventHash } from "@/lib/qr/hash-chain";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Single writer for append-only lifecycle/identity event subcollections.
 * Reads the most recent event to chain against, computes the new hash,
 * and writes — this is the one place that logic lives, used by DPI
 * creation (below) and reusable for weaver identity events, export
 * events, etc. as those writers are built.
 */
export async function appendLifecycleEvent(args: {
  collectionPath: string; // e.g. `productIdentities/${dpiId}/lifecycleEvents`
  type: string;
  payload: Record<string, unknown>;
  actorId: string;
  actorRole: string;
}): Promise<string> {
  const subcollection = adminDb.collection(args.collectionPath);

  const lastEventSnap = await subcollection.orderBy("timestamp", "desc").limit(1).get();
  const prevEventHash = lastEventSnap.empty ? null : (lastEventSnap.docs[0].data().eventHash as string);

  const timestampMillis = Date.now();
  const eventHash = computeEventHash({ type: args.type, payload: args.payload, timestampMillis }, prevEventHash);

  const docRef = await subcollection.add({
    type: args.type,
    payload: args.payload,
    actorId: args.actorId,
    actorRole: args.actorRole,
    timestamp: FieldValue.serverTimestamp(),
    prevEventHash,
    eventHash,
  });

  return docRef.id;
}
