"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

const LIFECYCLE_STAGES = [
  { label: "Registered", detail: "Weaver creates the product and its identity begins" },
  { label: "Heritage story generated", detail: "AI-assisted, weaver-reviewed origin narrative" },
  { label: "Verified", detail: "LoomLens analysis + human cluster officer sign-off" },
  { label: "QR identity issued", detail: "Tamper-evident, publicly scannable provenance" },
  { label: "Reviewed & exhibited", detail: "Buyer reviews, exhibitions, awards accumulate" },
  { label: "Exported", detail: "International sale recorded, identity travels with it" },
];

export function LifecycleTimeline() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="mx-auto max-w-2xl text-center"
      >
        <h2 className="font-display text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-4xl">
          An identity that grows with the product
        </h2>
        <p className="mt-4 text-neutral-600 dark:text-neutral-400">
          Not a certificate you print once — a history that accumulates, verifiable at every scan.
        </p>
      </motion.div>

      <motion.ol
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="relative mt-16 space-y-8 border-l border-neutral-200 pl-8 dark:border-neutral-800"
      >
        {LIFECYCLE_STAGES.map((stage, i) => (
          <motion.li key={stage.label} variants={fadeUp} className="relative">
            <span className="absolute -left-[calc(2rem+5px)] top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-accent-500 text-white">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </span>
            <p className="font-display text-base font-semibold text-neutral-900 dark:text-neutral-50">
              {i + 1}. {stage.label}
            </p>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{stage.detail}</p>
          </motion.li>
        ))}
      </motion.ol>
    </section>
  );
}
