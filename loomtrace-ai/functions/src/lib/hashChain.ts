import { createHash } from "node:crypto";

/**
 * Mirrors src/lib/qr/hash-chain.ts exactly. Duplicated (not imported)
 * because functions/ is a genuinely separate deployable TypeScript
 * package from the Next.js app — this is the one deliberate exception to
 * "no duplicated code" in the whole codebase, and it's justified by a
 * real packaging boundary, not carelessness. If this logic ever needs to
 * change, both copies must change together; that tradeoff is preferable
 * to bundling the Next.js app's src/ tree into the Functions deploy.
 */
export function canonicalize(obj: Record<string, unknown>): string {
  const sortedKeys = Object.keys(obj).sort();
  const sorted: Record<string, unknown> = {};
  for (const key of sortedKeys) sorted[key] = obj[key];
  return JSON.stringify(sorted);
}

export function computeEventHash(
  event: { type: string; payload: Record<string, unknown>; timestampMillis: number },
  prevEventHash: string | null
): string {
  const input = `${prevEventHash ?? "GENESIS"}|${event.type}|${event.timestampMillis}|${canonicalize(event.payload)}`;
  return createHash("sha256").update(input).digest("hex");
}
