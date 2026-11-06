import type { Variants } from "framer-motion";

/**
 * Reusable animation variants. Marketing components import from here
 * instead of inlining variant objects — keeps the "smooth, elegant, not
 * overused" motion language consistent site-wide instead of each section
 * inventing its own timing/easing.
 */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] },
  }),
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export const viewportOnce = { once: true, margin: "-80px" };
