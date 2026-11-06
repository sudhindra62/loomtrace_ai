"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

const NAV_LINKS = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/verify", label: "Verify a product" },
  { href: "/for-weavers", label: "For weavers" },
  { href: "/government", label: "For government" },
  { href: "/heritage", label: "Heritage archive" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled ? "glass shadow-soft" : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 font-display text-sm font-bold text-white dark:bg-white dark:text-neutral-900">
            L
          </span>
          <span className="font-display text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            LoomTrace AI
          </span>
        </Link>

        <ul className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href as never}
                className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          <Link
            href="/login"
            className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-soft transition-transform hover:scale-[1.02] dark:bg-white dark:text-neutral-900"
          >
            Get started
          </Link>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <ThemeToggle />
          <button
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-lg p-2"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden glass lg:hidden"
          >
            <ul className="flex flex-col gap-1 px-6 py-4">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href as never}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="mt-2 flex gap-3 px-3">
                <Link href="/login" className="flex-1 rounded-lg border border-neutral-300 py-2 text-center text-sm font-medium dark:border-neutral-700">
                  Sign in
                </Link>
                <Link href="/register" className="flex-1 rounded-lg bg-neutral-900 py-2 text-center text-sm font-medium text-white dark:bg-white dark:text-neutral-900">
                  Get started
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
