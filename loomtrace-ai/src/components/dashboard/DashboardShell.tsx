"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { signOut } from "@/features/auth/services/auth.service";

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface DashboardShellProps {
  navItems: DashboardNavItem[];
  roleLabel: string;
  userName: string;
  userId: string;
  children: React.ReactNode;
}

/**
 * One shell, parameterized by role — this is what keeps
 * weaver/buyer/government/admin dashboards visually and structurally
 * consistent instead of four independently-drifting layouts.
 */
export function DashboardShell({ navItems, roleLabel, userName, userId, children }: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 lg:flex">
        <SidebarContent navItems={navItems} roleLabel={roleLabel} pathname={pathname} />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white dark:bg-neutral-900 lg:hidden"
            >
              <SidebarContent
                navItems={navItems}
                roleLabel={roleLabel}
                pathname={pathname}
                onNavigate={() => setMobileOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 dark:border-neutral-800 dark:bg-neutral-900 lg:px-8">
          <button
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-2">
            <NotificationBell userId={userId} />
            <ThemeToggle />
            <button
              onClick={() => signOut()}
              className="ml-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Sign out
            </button>
          </div>
        </header>

        <main id="main-content" className="flex-1 px-4 py-8 lg:px-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  navItems,
  roleLabel,
  pathname,
  onNavigate,
}: {
  navItems: DashboardNavItem[];
  roleLabel: string;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="flex h-16 items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 font-display text-sm font-bold text-white dark:bg-white dark:text-neutral-900">
            L
          </span>
          <span className="font-display text-sm font-semibold tracking-tight">LoomTrace</span>
        </Link>
        {onNavigate && (
          <button aria-label="Close menu" onClick={onNavigate} className="rounded-lg p-1.5 lg:hidden">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <p className="px-5 pb-2 text-xs font-medium uppercase tracking-wide text-neutral-400">{roleLabel}</p>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href as never}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-accent-50 text-accent-700 dark:bg-accent-950 dark:text-accent-400"
                  : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
