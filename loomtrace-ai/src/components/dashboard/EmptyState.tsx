import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionLabel?: string;
  actionHref?: string;
  compact?: boolean;
}

/**
 * Every empty state in the product must be genuinely useful per Phase 1
 * Rev 3 §9 UX strategy — this component forces callers to supply a real
 * title/description rather than defaulting to "No data", and optionally
 * a next action, so a first-time weaver with zero products sees a guided
 * path, not a dead end.
 */
export function EmptyState({ title, description, icon: Icon = Inbox, actionLabel, actionHref, compact }: EmptyStateProps) {
  return (
    <div className={compact ? "flex flex-col items-center text-center" : "flex flex-col items-center py-16 text-center"}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 dark:bg-neutral-800">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-neutral-900 dark:text-neutral-50">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-neutral-500">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref as never}
          className="mt-5 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-900"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
