import type { FirestoreDataConverter, QueryDocumentSnapshot } from "firebase/firestore";

/**
 * One generic converter factory instead of hand-rolling a converter per
 * collection — every hook in features/*/hooks gets typed reads/writes
 * for free, and there's exactly one place that would need to change if
 * the conversion strategy ever changed (e.g. adding runtime Zod parsing
 * of documents read from Firestore).
 */
export function typedConverter<T extends { id: string }>(): FirestoreDataConverter<T> {
  return {
    toFirestore(data: T) {
      const { id, ...rest } = data;
      return rest;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot) {
      return { id: snapshot.id, ...snapshot.data() } as T;
    },
  };
}
