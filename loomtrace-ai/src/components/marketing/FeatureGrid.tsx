"use client";

import { motion } from "framer-motion";
import { Fingerprint, ScanEye, LineChart, LandPlot, QrCode, Users } from "lucide-react";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

const FEATURES = [
  {
    icon: Fingerprint,
    title: "Digital Product Identity",
    description:
      "Every product gets a living identity that grows over its lifetime — origin story, verification, reviews, exhibitions, exports, ownership — not a static certificate.",
  },
  {
    icon: ScanEye,
    title: "LoomLens AI Verification Engine",
    description:
      "Explainable, image-based authenticity analysis: weaving-style detection, confidence scoring, and the reasoning behind every result — assisting human verifiers, never replacing them.",
  },
  {
    icon: LineChart,
    title: "AI Market Intelligence",
    description:
      "Real, grounded decision support for weavers — price ranges, demand scores, and production guidance, reasoned over actual market data, not guesswork.",
  },
  {
    icon: LandPlot,
    title: "National Handloom Intelligence Center",
    description:
      "Cluster health heatmaps, demand forecasting, and an AI early-warning system that flags declining clusters and counterfeit hotspots before they become crises.",
  },
  {
    icon: QrCode,
    title: "Public QR Verification",
    description:
      "Anyone can scan a product's QR code and see its full, tamper-evident history — no login, no app install, just the truth about what they're buying.",
  },
  {
    icon: Users,
    title: "Verified Weaver Identity",
    description:
      "A portable professional identity for every artisan — skills, certifications, training, reputation — built once, valid everywhere on the platform.",
  },
];

export function FeatureGrid() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="mx-auto max-w-2xl text-center"
      >
        <h2 className="font-display text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-4xl">
          Infrastructure, not just a marketplace
        </h2>
        <p className="mt-4 text-neutral-600 dark:text-neutral-400">
          Six systems working together to make authenticity provable, markets accessible, and policy decisions
          grounded in real data.
        </p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {FEATURES.map((feature) => (
          <motion.div
            key={feature.title}
            variants={fadeUp}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="group rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft transition-colors hover:border-accent-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-accent-800"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-50 text-accent-600 transition-colors group-hover:bg-accent-500 group-hover:text-white dark:bg-accent-950 dark:text-accent-400">
              <feature.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-5 font-display text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
