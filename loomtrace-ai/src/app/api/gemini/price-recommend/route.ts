import { NextRequest, NextResponse } from "next/server";
import { getVerifiedSession } from "@/lib/firebase/session";
import { adminDb } from "@/lib/firebase/admin";
import { priceRecommendRequestSchema, priceRecommendResponseSchema } from "@/lib/validation/ai.schema";
import { generateJsonWithGemini, textPart, GeminiError } from "@/lib/gemini/client";
import { buildPriceRecommendPrompt, PROMPT_VERSIONS } from "@/lib/gemini/prompts";
import { logAiDecision } from "@/lib/ai/logAiDecision";
import { enforceRateLimit } from "@/lib/security/rateLimit";

export async function POST(request: NextRequest) {
  const session = await getVerifiedSession();
  if (!session || session.role !== "weaver") {
    return NextResponse.json({ error: { code: "forbidden", message: "Weaver role required." } }, { status: 403 });
  }

  if (!(await enforceRateLimit(session.uid, "gemini_price", 20))) {
    return NextResponse.json(
      { error: { code: "rate_limited", message: "Too many requests. Try again in a minute." } },
      { status: 429 }
    );
  }

  const parsed = priceRecommendRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "validation_error", message: parsed.error.issues[0]?.message ?? "Invalid input" } },
      { status: 400 }
    );
  }

  try {
    // Real grounding data, queried before the Gemini call — this is the
    // enforcement of "never a bare LLM guess" (Phase 1 Rev 2 §4).
    const comparablesSnap = await adminDb
      .collection("products")
      .where("category", "==", parsed.data.category)
      .where("clusterId", "==", parsed.data.clusterId)
      .where("status", "==", "published")
      .limit(8)
      .get();

    const comparableProducts = comparablesSnap.docs.map((d) => {
      const data = d.data();
      return {
        title: data.title as string,
        priceMin: data.priceRange?.min as number,
        priceMax: data.priceRange?.max as number,
      };
    });

    const raw = await generateJsonWithGemini<unknown>({
      parts: [textPart(buildPriceRecommendPrompt({ ...parsed.data, comparableProducts }))],
      temperature: 0.3,
    });

    const result = priceRecommendResponseSchema.safeParse(raw);
    if (!result.success) {
      console.error("[gemini/price-recommend] response shape mismatch", result.error);
      return NextResponse.json(
        { error: { code: "ai_response_invalid", message: "Could not generate price guidance right now." } },
        { status: 502 }
      );
    }

    await logAiDecision({
      decisionType: "price_recommend",
      promptVersion: PROMPT_VERSIONS.priceRecommend,
      subjectUserId: session.uid,
      inputRef: parsed.data.category,
      output: { ...result.data, comparableCount: comparableProducts.length },
    });

    return NextResponse.json({ ...result.data, comparableCount: comparableProducts.length });
  } catch (err) {
    const message = err instanceof GeminiError ? err.message : "Could not generate price guidance right now.";
    console.error("[gemini/price-recommend] failed", err);
    return NextResponse.json({ error: { code: "generation_failed", message } }, { status: 502 });
  }
}
