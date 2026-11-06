import { describe, it, expect } from "vitest";
import { computeEventHash, verifyEventHash, verifyChain } from "@/lib/qr/hash-chain";

describe("hash-chain", () => {
  it("produces a deterministic hash regardless of payload key order", () => {
    const a = computeEventHash({ type: "registered", payload: { x: 1, y: 2 }, timestampMillis: 1000 }, null);
    const b = computeEventHash({ type: "registered", payload: { y: 2, x: 1 }, timestampMillis: 1000 }, null);
    expect(a).toBe(b);
  });

  it("produces different hashes for different payloads", () => {
    const a = computeEventHash({ type: "registered", payload: { x: 1 }, timestampMillis: 1000 }, null);
    const b = computeEventHash({ type: "registered", payload: { x: 2 }, timestampMillis: 1000 }, null);
    expect(a).not.toBe(b);
  });

  it("chains correctly against a previous hash", () => {
    const genesis = computeEventHash({ type: "registered", payload: {}, timestampMillis: 1000 }, null);
    const next = computeEventHash({ type: "verified", payload: { by: "officer1" }, timestampMillis: 2000 }, genesis);
    expect(verifyEventHash({ type: "verified", payload: { by: "officer1" }, timestampMillis: 2000 }, genesis, next)).toBe(true);
  });

  it("detects a tampered payload", () => {
    const genesis = computeEventHash({ type: "registered", payload: {}, timestampMillis: 1000 }, null);
    const claimedHash = computeEventHash({ type: "verified", payload: { by: "officer1" }, timestampMillis: 2000 }, genesis);
    // Same claimed hash, but payload was altered after the fact.
    const tampered = verifyEventHash({ type: "verified", payload: { by: "officer2" }, timestampMillis: 2000 }, genesis, claimedHash);
    expect(tampered).toBe(false);
  });

  it("verifyChain finds the index of a broken link", () => {
    const e1Hash = computeEventHash({ type: "registered", payload: {}, timestampMillis: 1000 }, null);
    const e2Hash = computeEventHash({ type: "verified", payload: {}, timestampMillis: 2000 }, e1Hash);

    const chain = [
      { type: "registered", payload: {}, timestampMillis: 1000, prevEventHash: null, eventHash: e1Hash },
      // Break the chain: prevEventHash doesn't match e1Hash.
      { type: "verified", payload: {}, timestampMillis: 2000, prevEventHash: "wrong-hash", eventHash: e2Hash },
    ];

    expect(verifyChain(chain)).toBe(1);
  });

  it("verifyChain returns null for an intact chain", () => {
    const e1Hash = computeEventHash({ type: "registered", payload: {}, timestampMillis: 1000 }, null);
    const e2Hash = computeEventHash({ type: "verified", payload: {}, timestampMillis: 2000 }, e1Hash);

    const chain = [
      { type: "registered", payload: {}, timestampMillis: 1000, prevEventHash: null, eventHash: e1Hash },
      { type: "verified", payload: {}, timestampMillis: 2000, prevEventHash: e1Hash, eventHash: e2Hash },
    ];

    expect(verifyChain(chain)).toBeNull();
  });
});
