"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ScanLine, ShieldCheck } from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

export function Hero() {
  const reduceMotion = useReducedMotionSafe();

  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-20 lg:pt-28">
      {/* Ambient gradient lighting — the "ambient glow" premium-SaaS
          background treatment, kept subtle and behind everything. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute left-1/2 top-[-10%] h-[600px] w-[900px] -translate-x-1/2 opacity-40 blur-3xl dark:opacity-30"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(238,123,53,0.35) 0%, rgba(238,123,53,0.08) 45%, transparent 70%)",
          }}
        />
        <WeavePattern />
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mx-auto flex max-w-4xl flex-col items-center text-center"
      >
        <motion.div
          variants={fadeUp}
          className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/60 px-4 py-1.5 text-xs font-medium text-neutral-600 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-400"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
          Digital Public Infrastructure · Ministry of Textiles
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="mt-6 text-balance font-display text-4xl font-semibold leading-[1.1] tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-5xl lg:text-6xl"
        >
          Every authentic handloom,{" "}
          <span className="bg-gradient-to-r from-accent-600 to-accent-400 bg-clip-text text-transparent">
            a verified identity.
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mt-6 max-w-2xl text-balance text-lg text-neutral-600 dark:text-neutral-400"
        >
          LoomTrace AI gives every genuine handloom product a living digital identity — from the weaver&apos;s loom
          in Varanasi or Pochampally to the buyer&apos;s doorstep — so authenticity is provable, weavers reach real
          markets, and policymakers see the handloom economy as it actually is.
        </motion.p>

        <motion.div variants={fadeUp} className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/marketplace"
            className="group inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-6 py-3 text-sm font-medium text-white shadow-soft transition-transform hover:scale-[1.02] dark:bg-white dark:text-neutral-900"
          >
            Explore verified products
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/for-weavers"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
          >
            Register as a weaver
          </Link>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="mt-16 grid w-full max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4"
        >
          <StatChip value="28" label="States & UTs covered" />
          <StatChip value="140+" label="Weaving clusters mapped" />
          <StatChip icon={<ShieldCheck className="h-4 w-4" />} value="AI-assisted" label="Authenticity verification" />
          <StatChip icon={<ScanLine className="h-4 w-4" />} value="QR" label="Public provenance, no login" />
        </motion.div>
      </motion.div>

      {/* Floating verification-card mockup — a concrete glimpse of the
          product, not just abstract marketing copy, without needing a
          real screenshot/stock photo. */}
      {!reduceMotion && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto mt-20 max-w-3xl"
        >
          <VerificationCardMockup />
        </motion.div>
      )}
    </section>
  );
}

function StatChip({ value, label, icon }: { value: string; label: string; icon?: React.ReactNode }) {
  return (
    <div className="glass flex flex-col items-center gap-1 rounded-xl px-4 py-4 shadow-soft">
      <div className="flex items-center gap-1.5 font-display text-xl font-semibold text-neutral-900 dark:text-neutral-50">
        {icon}
        {value}
      </div>
      <span className="text-center text-xs text-neutral-500">{label}</span>
    </div>
  );
}

function WeavePattern() {
  return (
    <svg aria-hidden className="absolute inset-x-0 top-0 h-[500px] w-full opacity-[0.05] dark:opacity-[0.07]">
      <defs>
        <pattern id="hero-weave" width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M0 14h28M14 0v28" stroke="currentColor" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hero-weave)" />
    </svg>
  );
}

function VerificationCardMockup() {
  return (
    <div className="glass overflow-hidden rounded-2xl shadow-glass">
      <div className="flex items-center justify-between border-b border-neutral-200/60 px-6 py-4 dark:border-neutral-800/60">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-accent-500" />
          <span className="text-sm font-medium">Digital Product Identity</span>
        </div>
        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-400">
          Verified
        </span>
      </div>
      <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2">
        <div className="aspect-square rounded-xl bg-gradient-to-br from-accent-100 to-accent-50 dark:from-accent-900/30 dark:to-neutral-900" />
        <div className="flex flex-col justify-center gap-3">
          <div>
            <p className="text-xs text-neutral-500">Product</p>
            <p className="font-display text-lg font-semibold">Handwoven Banarasi Silk Saree</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Technique</p>
            <p className="text-sm">Jamdani-influenced Banarasi weave · 94% match confidence</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Weaver</p>
            <p className="text-sm">Verified artisan · Varanasi cluster · 22 years experience</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Lifecycle</p>
            <p className="text-sm">Registered → Verified → 2 exhibitions → Exported to UK</p>
          </div>
        </div>
      </div>
    </div>
  );
}
