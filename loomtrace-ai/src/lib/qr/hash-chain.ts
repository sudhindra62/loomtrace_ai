import "server-only";
import { createHash } from "node:crypto";

/**
 * The hash-chaining utility flagged as deferred in Phase 2 (PHASE_2_NOTES.md)
 * — built now, once, against its real call sites (DPI lifecycle events,
 * weaver identity events, and any future event-sourced collection) rather
 * than guessed in isolation.
 *
 * Chain rule: eventHash = sha256(prevEventHash + canonical(payload) + type + timestamp).
 * A break in the chain (an event whose eventHash doesn't match a
 * recomputation from its neighbors) is what a periodic integrity-check
 * Cloud Function (Phase 1 Rev 3 §2) would detect — this file is the
 * shared primitive that both the write path and that verification job
 * depend on, so they can never drift out of sync with each other.
 */

interface ChainableEvent {
  type: string;
  payload: Record<string, unknown>;
  timestampMillis: number;
}

/** Deterministic JSON stringify — object key order must not affect the hash. */
function canonicalize(obj: Record<string, unknown>): string {
  const sortedKeys = Object.keys(obj).sort();
  const sorted: Record<string, unknown> = {};
  for (const key of sortedKeys) sorted[key] = obj[key];
  return JSON.stringify(sorted);
}

export function computeEventHash(event: ChainableEvent, prevEventHash: string | null): string {
  const input = `${prevEventHash ?? "GENESIS"}|${event.type}|${event.timestampMillis}|${canonicalize(event.payload)}`;
  return createHash("sha256").update(input).digest("hex");
}

/** Verifies a single event against its claimed prevHash/eventHash pair. */
export function verifyEventHash(
  event: ChainableEvent,
  prevEventHash: string | null,
  claimedEventHash: string
): boolean {
  return computeEventHash(event, prevEventHash) === claimedEventHash;
}

/** Verifies an entire ordered chain, returning the index of the first break, or null if intact. */
export function verifyChain(
  events: { type: string; payload: Record<string, unknown>; timestampMillis: number; prevEventHash: string | null; eventHash: string }[]
): number | null {
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    if (!verifyEventHash(e, e.prevEventHash, e.eventHash)) return i;
  }
  return null;
}
