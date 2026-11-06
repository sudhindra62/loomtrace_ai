"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { fadeUp, viewportOnce } from "@/lib/motion";

export function CTASection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="relative overflow-hidden rounded-3xl bg-neutral-900 px-8 py-16 text-center dark:bg-white sm:px-16"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(50% 50% at 50% 0%, rgba(238,123,53,0.35) 0%, transparent 70%)",
          }}
        />
        <h2 className="relative font-display text-3xl font-semibold tracking-tight text-white dark:text-neutral-900 sm:text-4xl">
          Whether you weave, buy, or govern —<br />there&apos;s a place for you here
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-neutral-300 dark:text-neutral-600">
          Join the platform building verifiable trust into India&apos;s handloom economy.
        </p>
        <div className="relative mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/register"
            className="group inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-medium text-neutral-900 shadow-soft transition-transform hover:scale-[1.02] dark:bg-neutral-900 dark:text-white"
          >
            Get started free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/government"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10 dark:border-neutral-300 dark:text-neutral-900 dark:hover:bg-neutral-100"
          >
            Government inquiries
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
