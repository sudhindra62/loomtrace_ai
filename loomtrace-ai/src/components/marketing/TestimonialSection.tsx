"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

/**
 * Fictional, composite personas representative of India's weaving
 * clusters — built for demo realism per the brief ("avoid lorem ipsum,
 * generate realistic Indian artisan profiles"). Not real individuals;
 * swap for real, consented weaver stories before any production launch.
 */
const TESTIMONIALS = [
  {
    name: "Kamala Devi",
    role: "Master Weaver, Banarasi Silk",
    cluster: "Varanasi, Uttar Pradesh",
    quote:
      "For years, buyers doubted whether my sarees were truly handwoven. Now they scan the QR code and see the whole story — the loom, the verification, everything.",
  },
  {
    name: "Ramesh Nair",
    role: "Third-generation Weaver, Ikat",
    cluster: "Pochampally, Telangana",
    quote:
      "The price guidance told me my double-Ikat pieces were underpriced compared to similar work. I adjusted, and buyers still came.",
  },
  {
    name: "Ayesha Khatun",
    role: "Weaver & Cooperative Secretary, Jamdani",
    cluster: "Nadia district, West Bengal",
    quote:
      "Our cooperative used to rely on middlemen entirely. Now export buyers find us directly through the marketplace, and the National Handloom Intelligence Center shows our cluster is growing.",
  },
];

export function TestimonialSection() {
  return (
    <section className="bg-neutral-50 py-24 dark:bg-neutral-900/40">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="font-display text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-4xl">
            Built around the people who weave
          </h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {TESTIMONIALS.map((t) => (
            <motion.figure
              key={t.name}
              variants={fadeUp}
              className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft dark:border-neutral-800 dark:bg-neutral-900"
            >
              <blockquote className="flex-1 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-100 font-display text-sm font-semibold text-accent-700 dark:bg-accent-950 dark:text-accent-400">
                  {t.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">{t.name}</p>
                  <p className="text-xs text-neutral-500">
                    {t.role} · {t.cluster}
                  </p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
