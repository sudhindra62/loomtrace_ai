"use client";

import { useMutation } from "@tanstack/react-query";
import type { ProductCreateInput } from "@/lib/validation/ai.schema";

async function authedFetch(url: string, body: unknown) {
  // No Authorization header needed — same-origin fetch automatically
  // sends the httpOnly session cookie that getVerifiedSession() reads
  // server-side. Adding a Bearer token here would be dead code the
  // Route Handlers never check.
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error?.message ?? "Request failed");
  return json;
}

export function useCreateProduct() {
  return useMutation({
    mutationFn: (input: ProductCreateInput): Promise<{ productId: string }> =>
      authedFetch("/api/products/create", input),
  });
}

export function useGenerateDescription() {
  return useMutation({
    mutationFn: (input: { productId: string; craftType: string; materials: string[]; clusterName: string }) =>
      authedFetch("/api/gemini/describe", input) as Promise<{
        description: string;
        heritageStory: string;
        tags: string[];
      }>,
  });
}

export function useRunLoomLens() {
  return useMutation({
    mutationFn: (input: { productId: string; imageBase64: string; mimeType: string; consentConfirmed: true }) =>
      authedFetch("/api/gemini/vision", input) as Promise<{
        detectedStyle: string;
        confidence: number;
        reasoning: string;
        authenticityIndicators: { handweaveIrregularitiesPresent: boolean | null; notes: string };
        materialEstimate: string;
        requiresHumanReview: boolean;
      }>,
  });
}

export function usePriceRecommendation() {
  return useMutation({
    mutationFn: (input: { category: string; materials: string[]; clusterId: string; clusterName: string }) =>
      authedFetch("/api/gemini/price-recommend", input) as Promise<{
        suggestedMin: number;
        suggestedMax: number;
        reasoning: string;
        confidence: "low" | "medium" | "high";
        comparableCount: number;
      }>,
  });
}

export function useCreateDpi() {
  return useMutation({
    mutationFn: (input: { productId: string }) =>
      authedFetch("/api/dpi/create", input) as Promise<{
        dpiId: string;
        qrCodeUrl: string;
        verificationUrl: string;
      }>,
  });
}
