import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Every Gemini call in the app writes here (Phase 1 Rev 3 §5 — AI audit
 * logs). One function, called from every /api/gemini/* route, so this
 * can never be "the route someone forgot to log."
 */
export async function logAiDecision(args: {
  decisionType: "describe" | "vision" | "price_recommend";
  promptVersion: string;
  subjectUserId: string;
  inputRef: string; // e.g. productId
  output: unknown;
  confidence?: number;
  confidenceThreshold?: number;
}): Promise<void> {
  const belowThreshold =
    args.confidence !== undefined && args.confidenceThreshold !== undefined
      ? args.confidence < args.confidenceThreshold
      : false;

  await adminDb.collection("aiDecisions").add({
    decisionType: args.decisionType,
    promptVersion: args.promptVersion,
    subjectUserId: args.subjectUserId,
    inputRef: args.inputRef,
    output: args.output,
    confidence: args.confidence ?? null,
    reviewStatus: belowThreshold ? "pending_human_review" : "auto_approved",
    humanOverride: null,
    appeal: null,
    createdAt: FieldValue.serverTimestamp(),
  });
}
