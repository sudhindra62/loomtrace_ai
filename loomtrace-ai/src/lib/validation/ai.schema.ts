import { z } from "zod";

export const describeRequestSchema = z.object({
  productId: z.string().min(1),
  craftType: z.string().min(1).max(100),
  materials: z.array(z.string().min(1)).min(1).max(10),
  clusterName: z.string().min(1).max(100),
});
export type DescribeRequest = z.infer<typeof describeRequestSchema>;

export const describeResponseSchema = z.object({
  description: z.string(),
  heritageStory: z.string(),
  tags: z.array(z.string()),
});

export const visionRequestSchema = z.object({
  productId: z.string().min(1),
  imageBase64: z.string().min(1),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  // Explicit consent flag, required — Responsible AI framework (Rev 3 §5):
  // no image is sent to Gemini without this being true.
  consentConfirmed: z.literal(true),
});
export type VisionRequest = z.infer<typeof visionRequestSchema>;

export const visionResponseSchema = z.object({
  detectedStyle: z.string(),
  confidence: z.number().min(0).max(100),
  reasoning: z.string(),
  authenticityIndicators: z.object({
    handweaveIrregularitiesPresent: z.boolean().nullable(),
    notes: z.string(),
  }),
  materialEstimate: z.string(),
  recommendForHumanReview: z.boolean(),
});

export const priceRecommendRequestSchema = z.object({
  category: z.string().min(1).max(100),
  materials: z.array(z.string().min(1)).min(1).max(10),
  clusterId: z.string().min(1),
  clusterName: z.string().min(1),
});
export type PriceRecommendRequest = z.infer<typeof priceRecommendRequestSchema>;

export const priceRecommendResponseSchema = z.object({
  suggestedMin: z.number().nonnegative(),
  suggestedMax: z.number().nonnegative(),
  reasoning: z.string(),
  confidence: z.enum(["low", "medium", "high"]),
});

export const qrGenerateRequestSchema = z.object({
  dpiId: z.string().min(1),
});

export const productCreateSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(150),
  category: z.string().min(1, "Select a category"),
  craftType: z.string().min(1, "Select a craft/weaving technique"),
  materials: z.array(z.string().min(1)).min(1, "Add at least one material"),
  clusterId: z.string().min(1, "Select your weaving cluster"),
  clusterName: z.string().min(1),
  priceMin: z.coerce.number().positive("Enter a minimum price"),
  priceMax: z.coerce.number().positive("Enter a maximum price"),
  images: z.array(z.string()).min(1, "Add at least one product image"),
}).refine((data) => data.priceMax >= data.priceMin, {
  message: "Maximum price must be greater than or equal to minimum price",
  path: ["priceMax"],
});
export type ProductCreateInput = z.infer<typeof productCreateSchema>;
