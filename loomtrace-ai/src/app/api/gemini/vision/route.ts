import { NextRequest, NextResponse } from "next/server";
import { getVerifiedSession } from "@/lib/firebase/session";
import { visionRequestSchema, visionResponseSchema } from "@/lib/validation/ai.schema";
import { generateJsonWithGemini, imagePart, textPart, GeminiError } from "@/lib/gemini/client";
import { buildVisionPrompt, PROMPT_VERSIONS } from "@/lib/gemini/prompts";
import { logAiDecision } from "@/lib/ai/logAiDecision";
import { enforceRateLimit } from "@/lib/security/rateLimit";

// Confidence threshold below which a result is routed to mandatory human
// review before it can affect a product's verification status — Phase 1
// Rev 3 §5, made an actual enforced number here, not just a doc claim.
const HUMAN_REVIEW_THRESHOLD = 70;

export async function POST(request: NextRequest) {
  const session = await getVerifiedSession();
  if (!session || session.role !== "weaver") {
    return NextResponse.json({ error: { code: "forbidden", message: "Weaver role required." } }, { status: 403 });
  }

  if (!(await enforceRateLimit(session.uid, "gemini_vision", 10))) {
    return NextResponse.json(
      { error: { code: "rate_limited", message: "Too many requests. Try again in a minute." } },
      { status: 429 }
    );
  }

  const parsed = visionRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "validation_error",
          message:
            parsed.error.issues[0]?.path?.[0] === "consentConfirmed"
              ? "Consent to AI image analysis is required before this can run."
              : parsed.error.issues[0]?.message ?? "Invalid input",
        },
      },
      { status: 400 }
    );
  }

  try {
    const raw = await generateJsonWithGemini<unknown>({
      parts: [textPart(buildVisionPrompt()), imagePart(parsed.data.imageBase64, parsed.data.mimeType)],
      temperature: 0.2, // lower temperature for an analysis task — consistency matters more than creativity here
    });

    const result = visionResponseSchema.safeParse(raw);
    if (!result.success) {
      console.error("[gemini/vision] response shape mismatch", result.error);
      return NextResponse.json(
        { error: { code: "ai_response_invalid", message: "Could not analyze this image right now." } },
        { status: 502 }
      );
    }

    // Server-side override: never trust Gemini's own recommendForHumanReview
    // flag alone — recompute against our own threshold, since the
    // threshold is a platform policy decision, not the model's to set.
    const requiresHumanReview =
      result.data.recommendForHumanReview || result.data.confidence < HUMAN_REVIEW_THRESHOLD;

    await logAiDecision({
      decisionType: "vision",
      promptVersion: PROMPT_VERSIONS.vision,
      subjectUserId: session.uid,
      inputRef: parsed.data.productId,
      output: result.data,
      confidence: result.data.confidence,
      confidenceThreshold: HUMAN_REVIEW_THRESHOLD,
    });

    return NextResponse.json({ ...result.data, requiresHumanReview });
  } catch (err) {
    const message = err instanceof GeminiError ? err.message : "Could not analyze this image right now.";
    console.error("[gemini/vision] failed", err);
    return NextResponse.json({ error: { code: "analysis_failed", message } }, { status: 502 });
  }
}
