import { cn } from "@/lib/utils/cn";

function Shimmer({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800", className)} />;
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
      <Shimmer className="h-4 w-24" />
      <Shimmer className="mt-3 h-8 w-16" />
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
      <Shimmer className="aspect-square w-full" />
      <Shimmer className="mt-3 h-4 w-3/4" />
      <Shimmer className="mt-2 h-3 w-1/2" />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 border-b border-neutral-100 px-4 py-3 dark:border-neutral-800/60">
      <Shimmer className="h-4 w-1/4" />
      <Shimmer className="h-4 w-1/6" />
      <Shimmer className="h-4 w-1/6" />
      <Shimmer className="h-4 w-1/6" />
    </div>
  );
}
