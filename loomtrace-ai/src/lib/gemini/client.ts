import "server-only";

/**
 * Thin, server-only wrapper around the Gemini API. Every route in
 * app/api/gemini/* calls through this — one place to change model
 * version, retry logic, or error handling, per the "no duplicated code"
 * requirement.
 *
 * Never imported from client code: GEMINI_API_KEY has no NEXT_PUBLIC_
 * prefix, so it isn't bundled to the browser even if someone tried.
 */

const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export class GeminiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "GeminiError";
  }
}

interface GeminiPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

interface GenerateOptions {
  parts: GeminiPart[];
  /** Forces Gemini to return raw JSON matching this shape description, parsed for the caller. */
  jsonMode?: boolean;
  temperature?: number;
}

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new GeminiError("GEMINI_API_KEY is not configured on the server.");
  }
  return key;
}

export async function generateWithGemini({ parts, jsonMode = false, temperature = 0.4 }: GenerateOptions): Promise<string> {
  const res = await fetch(`${GEMINI_ENDPOINT}?key=${getApiKey()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        temperature,
        ...(jsonMode ? { responseMimeType: "application/json" } : {}),
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    // Internal detail logged server-side only; callers get a generic
    // GeminiError so route handlers can map it to a clean client message
    // without leaking upstream API internals.
    console.error("[gemini] request failed", res.status, body);
    throw new GeminiError("Gemini request failed.", res.status);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string") {
    throw new GeminiError("Gemini returned an unexpected response shape.");
  }
  return text;
}

export async function generateJsonWithGemini<T>(options: GenerateOptions): Promise<T> {
  const raw = await generateWithGemini({ ...options, jsonMode: true });
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new GeminiError("Gemini returned malformed JSON.");
  }
}

export function imagePart(base64Data: string, mimeType: string): GeminiPart {
  return { inlineData: { mimeType, data: base64Data } };
}

export function textPart(text: string): GeminiPart {
  return { text };
}
