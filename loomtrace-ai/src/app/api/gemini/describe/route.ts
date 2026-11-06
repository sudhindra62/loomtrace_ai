import { NextRequest, NextResponse } from "next/server";
import { getVerifiedSession } from "@/lib/firebase/session";
import { describeRequestSchema, describeResponseSchema } from "@/lib/validation/ai.schema";
import { generateJsonWithGemini, textPart } from "@/lib/gemini/client";
import { buildDescribePrompt, PROMPT_VERSIONS } from "@/lib/gemini/prompts";
import { logAiDecision } from "@/lib/ai/logAiDecision";
import { GeminiError } from "@/lib/gemini/client";
import { enforceRateLimit } from "@/lib/security/rateLimit";

export async function POST(request: NextRequest) {
  const session = await getVerifiedSession();
  if (!session || session.role !== "weaver") {
    return NextResponse.json({ error: { code: "forbidden", message: "Weaver role required." } }, { status: 403 });
  }

  if (!(await enforceRateLimit(session.uid, "gemini_describe", 20))) {
    return NextResponse.json(
      { error: { code: "rate_limited", message: "Too many requests. Try again in a minute." } },
      { status: 429 }
    );
  }

  const parsed = describeRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "validation_error", message: parsed.error.issues[0]?.message ?? "Invalid input" } },
      { status: 400 }
    );
  }

  try {
    const raw = await generateJsonWithGemini<unknown>({
      parts: [textPart(buildDescribePrompt(parsed.data))],
    });

    const result = describeResponseSchema.safeParse(raw);
    if (!result.success) {
      // Gemini didn't return the shape we asked for — fail loudly rather
      // than silently passing through malformed data to the client.
      console.error("[gemini/describe] response shape mismatch", result.error);
      return NextResponse.json(
        { error: { code: "ai_response_invalid", message: "Could not generate a description right now." } },
        { status: 502 }
      );
    }

    await logAiDecision({
      decisionType: "describe",
      promptVersion: PROMPT_VERSIONS.describe,
      subjectUserId: session.uid,
      inputRef: parsed.data.productId,
      output: result.data,
    });

    return NextResponse.json(result.data);
  } catch (err) {
    const message = err instanceof GeminiError ? err.message : "Could not generate a description right now.";
    console.error("[gemini/describe] failed", err);
    return NextResponse.json({ error: { code: "generation_failed", message } }, { status: 502 });
  }
}
