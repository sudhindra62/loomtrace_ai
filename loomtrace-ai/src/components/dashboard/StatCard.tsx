import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: { direction: "up" | "down"; value: string };
}

export function StatCard({ label, value, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">{label}</p>
        <Icon className="h-4 w-4 text-neutral-400" />
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="font-display text-2xl font-semibold text-neutral-900 dark:text-neutral-50">{value}</p>
        {trend && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium",
              trend.direction === "up" ? "text-green-600" : "text-red-600"
            )}
          >
            {trend.direction === "up" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
