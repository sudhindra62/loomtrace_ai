"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, Sparkles, ScanEye, LineChart, Fingerprint, X, Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { uploadProductImages } from "@/features/products/services/uploadProductImages";
import {
  useCreateProduct,
  useGenerateDescription,
  useRunLoomLens,
  usePriceRecommendation,
  useCreateDpi,
} from "@/features/products/hooks/useProductMutations";

const CRAFT_TYPES = ["Banarasi Silk", "Ikat", "Jamdani", "Kanjeevaram", "Chanderi", "Patola", "Muga Silk"];
const CATEGORIES = ["Saree", "Stole", "Fabric (by metre)", "Dupatta", "Home furnishing"];
const CLUSTERS = [
  { id: "varanasi-up", name: "Varanasi, Uttar Pradesh" },
  { id: "pochampally-tg", name: "Pochampally, Telangana" },
  { id: "nadia-wb", name: "Nadia district, West Bengal" },
  { id: "kanchipuram-tn", name: "Kanchipuram, Tamil Nadu" },
];

type Stage = "form" | "created" | "dpi_issued";

export default function NewProductPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [stage, setStage] = useState<Stage>("form");
  const [productId, setProductId] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: CATEGORIES[0],
    craftType: CRAFT_TYPES[0],
    materials: "",
    clusterId: CLUSTERS[0].id,
    priceMin: "",
    priceMax: "",
  });
  const [error, setError] = useState<string | null>(null);

  const [description, setDescription] = useState<{ description: string; heritageStory: string; tags: string[] } | null>(null);
  const [loomLensResult, setLoomLensResult] = useState<Awaited<ReturnType<ReturnType<typeof useRunLoomLens>["mutateAsync"]>> | null>(null);
  const [priceGuidance, setPriceGuidance] = useState<Awaited<ReturnType<ReturnType<typeof usePriceRecommendation>["mutateAsync"]>> | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [dpiResult, setDpiResult] = useState<{ dpiId: string; qrCodeUrl: string; verificationUrl: string } | null>(null);

  const createProduct = useCreateProduct();
  const generateDescription = useGenerateDescription();
  const runLoomLens = useRunLoomLens();
  const getPriceGuidance = usePriceRecommendation();
  const createDpi = useCreateDpi();

  const cluster = CLUSTERS.find((c) => c.id === form.clusterId)!;
  const materialsList = form.materials.split(",").map((m) => m.trim()).filter(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user) return;
    if (files.length === 0) {
      setError("Add at least one product image.");
      return;
    }
    if (materialsList.length === 0) {
      setError("List at least one material.");
      return;
    }

    try {
      setUploading(true);
      const imageUrls = await uploadProductImages(user.uid, files);
      setUploading(false);

      const result = await createProduct.mutateAsync({
        title: form.title,
        category: form.category,
        craftType: form.craftType,
        materials: materialsList,
        clusterId: form.clusterId,
        clusterName: cluster.name,
        priceMin: Number(form.priceMin),
        priceMax: Number(form.priceMax),
        images: imageUrls,
      });

      setProductId(result.productId);
      setStage("created");
    } catch (err) {
      setUploading(false);
      setError(err instanceof Error ? err.message : "Could not create product.");
    }
  };

  const handleGenerateDescription = async () => {
    if (!productId) return;
    const result = await generateDescription.mutateAsync({
      productId,
      craftType: form.craftType,
      materials: materialsList,
      clusterName: cluster.name,
    });
    setDescription(result);
  };

  const handleRunLoomLens = async () => {
    if (!productId || files.length === 0 || !consentGiven) return;
    const file = files[0];
    const base64 = await fileToBase64(file);
    const result = await runLoomLens.mutateAsync({
      productId,
      imageBase64: base64,
      mimeType: file.type as "image/jpeg" | "image/png" | "image/webp",
      consentConfirmed: true,
    });
    setLoomLensResult(result);
  };

  const handlePriceGuidance = async () => {
    const result = await getPriceGuidance.mutateAsync({
      category: form.category,
      materials: materialsList,
      clusterId: form.clusterId,
      clusterName: cluster.name,
    });
    setPriceGuidance(result);
  };

  const handleCreateDpi = async () => {
    if (!productId) return;
    const result = await createDpi.mutateAsync({ productId });
    setDpiResult(result);
    setStage("dpi_issued");
  };

  if (stage !== "form" && productId) {
    return (
      <div className="mx-auto max-w-2xl space-y-8">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Enhance &amp; verify your product</h1>
        <p className="text-sm text-neutral-500">
          Product created. These steps are optional but recommended before publishing.
        </p>

        <AiActionCard
          icon={Sparkles}
          title="AI-assisted description & heritage story"
          description="Generates buyer-facing copy grounded in the craft details you provided — you can edit before publishing."
          actionLabel="Generate description"
          onAction={handleGenerateDescription}
          loading={generateDescription.isPending}
        >
          {description && (
            <div className="mt-4 space-y-2 rounded-lg bg-neutral-50 p-4 text-sm dark:bg-neutral-800/50">
              <p>{description.description}</p>
              <p className="text-neutral-500">{description.heritageStory}</p>
            </div>
          )}
        </AiActionCard>

        <AiActionCard
          icon={ScanEye}
          title="LoomLens AI Verification Engine"
          description="AI-assisted analysis only — a government verification officer makes the final call. Requires your consent to process this image."
          actionLabel="Run analysis"
          onAction={handleRunLoomLens}
          loading={runLoomLens.isPending}
          disabled={!consentGiven}
          extraControl={
            <label className="mt-3 flex items-start gap-2 text-xs text-neutral-500">
              <input type="checkbox" checked={consentGiven} onChange={(e) => setConsentGiven(e.target.checked)} className="mt-0.5" />
              I consent to AI-assisted analysis of this product image.
            </label>
          }
        >
          {loomLensResult && (
            <div className="mt-4 space-y-1.5 rounded-lg bg-neutral-50 p-4 text-sm dark:bg-neutral-800/50">
              <p><span className="font-medium">Detected style:</span> {loomLensResult.detectedStyle}</p>
              <p><span className="font-medium">Confidence:</span> {loomLensResult.confidence}%</p>
              <p className="text-neutral-500">{loomLensResult.reasoning}</p>
              {loomLensResult.requiresHumanReview && (
                <p className="mt-1 text-amber-600">This result requires human verification before publishing as verified.</p>
              )}
            </div>
          )}
        </AiActionCard>

        <AiActionCard
          icon={LineChart}
          title="AI Market Intelligence"
          description="Price guidance reasoned over comparable products currently on the platform."
          actionLabel="Get price guidance"
          onAction={handlePriceGuidance}
          loading={getPriceGuidance.isPending}
        >
          {priceGuidance && (
            <div className="mt-4 space-y-1.5 rounded-lg bg-neutral-50 p-4 text-sm dark:bg-neutral-800/50">
              <p className="font-medium">
                ₹{priceGuidance.suggestedMin.toLocaleString("en-IN")} – ₹{priceGuidance.suggestedMax.toLocaleString("en-IN")}
              </p>
              <p className="text-neutral-500">{priceGuidance.reasoning}</p>
              <p className="text-xs text-neutral-400">
                Based on {priceGuidance.comparableCount} comparable listing{priceGuidance.comparableCount === 1 ? "" : "s"} · {priceGuidance.confidence} confidence
              </p>
            </div>
          )}
        </AiActionCard>

        {stage === "created" && (
          <AiActionCard
            icon={Fingerprint}
            title="Digital Product Identity"
            description="Issues a tamper-evident, publicly scannable identity for this product — its lifecycle starts here."
            actionLabel="Create Digital Product Identity"
            onAction={handleCreateDpi}
            loading={createDpi.isPending}
          />
        )}

        {dpiResult && (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center dark:border-green-900 dark:bg-green-950/30">
            <Image src={dpiResult.qrCodeUrl} alt="Product QR code" width={160} height={160} className="mx-auto rounded-lg" unoptimized />
            <p className="mt-4 text-sm font-medium text-green-800 dark:text-green-400">Digital Product Identity created</p>
            <button
              onClick={() => router.push("/weaver/products")}
              className="mt-4 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-900"
            >
              Back to products
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Add a product</h1>
      <p className="mt-1 text-sm text-neutral-500">Start with the basics — you can add AI-assisted details next.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <Field label="Title">
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Handwoven Banarasi Silk Saree — Peacock Motif"
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Category">
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Craft / weaving technique">
            <select value={form.craftType} onChange={(e) => setForm({ ...form, craftType: e.target.value })} className={inputClass}>
              {CRAFT_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Materials (comma-separated)">
          <input
            required
            value={form.materials}
            onChange={(e) => setForm({ ...form, materials: e.target.value })}
            placeholder="Mulberry silk, zari thread"
            className={inputClass}
          />
        </Field>

        <Field label="Weaving cluster">
          <select value={form.clusterId} onChange={(e) => setForm({ ...form, clusterId: e.target.value })} className={inputClass}>
            {CLUSTERS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Minimum price (₹)">
            <input required type="number" min={1} value={form.priceMin} onChange={(e) => setForm({ ...form, priceMin: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Maximum price (₹)">
            <input required type="number" min={1} value={form.priceMax} onChange={(e) => setForm({ ...form, priceMax: e.target.value })} className={inputClass} />
          </Field>
        </div>

        <Field label="Product images">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 p-6 text-center hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900">
            <Upload className="h-5 w-5 text-neutral-400" />
            <span className="mt-2 text-sm text-neutral-500">Click to upload, or drag images here</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => setFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])])}
            />
          </label>
          {files.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {files.map((file, i) => (
                <div key={i} className="relative">
                  <img src={URL.createObjectURL(file)} alt="" className="h-16 w-16 rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Field>

        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40">{error}</p>}

        <button
          type="submit"
          disabled={uploading || createProduct.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
        >
          {uploading || createProduct.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {uploading ? "Uploading images…" : createProduct.isPending ? "Creating…" : "Create product"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-900";

function AiActionCard({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  loading,
  disabled,
  extraControl,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  loading: boolean;
  disabled?: boolean;
  extraControl?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-950 dark:text-accent-400">
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="mt-0.5 text-xs text-neutral-500">{description}</p>
          {extraControl}
          <button
            onClick={onAction}
            disabled={loading || disabled}
            className="mt-3 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            {loading ? "Working…" : actionLabel}
          </button>
          {children}
        </div>
      </div>
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
