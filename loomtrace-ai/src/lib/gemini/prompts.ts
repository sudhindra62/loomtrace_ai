/**
 * Prompt templates, versioned by name (e.g. describe_v1) so the
 * `aiDecisions` audit log (Phase 1 Rev 3 §5) can record exactly which
 * prompt version produced a given output — required for the Responsible
 * AI explainability/appeal workflow.
 *
 * Discipline enforced throughout: every prompt that produces a number
 * (price, demand score) is given real retrieved data as grounding
 * context and instructed to reason over it, never to invent a number
 * from general knowledge alone (Phase 1 Rev 2 §4).
 */

export const PROMPT_VERSIONS = {
  describe: "describe_v1",
  vision: "vision_v1",
  priceRecommend: "price_recommend_v1",
} as const;

export function buildDescribePrompt(input: {
  craftType: string;
  materials: string[];
  clusterName: string;
}): string {
  return `You are writing a product description and a short heritage story for an authentic Indian handloom product, for a national verification platform (LoomTrace AI, Ministry of Textiles digital infrastructure).

Product details (all confirmed by the weaver, do not contradict them):
- Craft type / technique: ${input.craftType}
- Materials: ${input.materials.join(", ")}
- Weaving cluster: ${input.clusterName}

Write in a respectful, factual tone — celebrate the craft without exaggerated marketing language, and do not invent specific historical dates, named events, or claims you cannot ground in the given details.

Respond as strict JSON matching this shape:
{
  "description": string (2-3 sentences, buyer-facing product description),
  "heritageStory": string (3-4 sentences, the tradition and technique behind this craft type and cluster, general and factual, not about this specific individual item's fictional history),
  "tags": string[] (5-8 relevant search tags)
}`;
}

export function buildVisionPrompt(): string {
  return `You are LoomLens, an AI verification assistant for LoomTrace AI, a national platform for authenticating Indian handloom products. You are analyzing an uploaded product image.

CRITICAL constraint: you are providing AI-ASSISTED ANALYSIS ONLY. You do not issue certification and must not claim certainty. A human government verification officer makes the final authenticity determination — your job is to give them a well-reasoned starting point.

Analyze the image and respond as strict JSON matching this shape:
{
  "detectedStyle": string (best-guess weaving technique/style, e.g. "Ikat", "Jamdani", "Kanjeevaram" — or "Unclear" if not determinable),
  "confidence": number (0-100, calibrated — do not default to high confidence),
  "reasoning": string (2-3 sentences explaining which visual features informed the detection — motif density, weave structure, border pattern, etc.),
  "authenticityIndicators": {
    "handweaveIrregularitiesPresent": boolean | null (null if not determinable from image),
    "notes": string
  },
  "materialEstimate": string (likely fiber, explicitly caveated as a visual estimate, not a lab test),
  "recommendForHumanReview": boolean (true if confidence is below 70 or anything looks inconsistent)
}`;
}

export function buildPriceRecommendPrompt(input: {
  category: string;
  materials: string[];
  clusterName: string;
  comparableProducts: { title: string; priceMin: number; priceMax: number }[];
}): string {
  const comparablesText =
    input.comparableProducts.length > 0
      ? input.comparableProducts
          .map((p) => `- "${p.title}": ₹${p.priceMin}–₹${p.priceMax}`)
          .join("\n")
      : "No comparable products currently on the platform for this category/cluster.";

  return `You are providing price guidance for a weaver listing a handloom product on LoomTrace AI's AI Market Intelligence tool.

Product: ${input.category}, materials: ${input.materials.join(", ")}, cluster: ${input.clusterName}

Real comparable products currently listed on the platform:
${comparablesText}

Base your suggested price range primarily on the comparable products above when available. If there are no comparables, say so explicitly in your reasoning rather than inventing a number from general knowledge, and give a wider, more conservative range.

Respond as strict JSON matching this shape:
{
  "suggestedMin": number (INR),
  "suggestedMax": number (INR),
  "reasoning": string (2-3 sentences, reference the actual comparable data or explicitly note its absence),
  "confidence": "low" | "medium" | "high"
}`;
}
