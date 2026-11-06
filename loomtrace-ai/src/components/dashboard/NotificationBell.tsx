"use client";

import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { EmptyState } from "@/components/dashboard/EmptyState";

export function NotificationBell({ userId }: { userId: string }) {
  const { notifications, unreadCount, markAsRead } = useNotifications(userId);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-medium text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-neutral-200 bg-white shadow-glass dark:border-neutral-800 dark:bg-neutral-900">
          <div className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
            <h3 className="text-sm font-semibold">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  title="No notifications yet"
                  description="Updates about your orders, verifications, and activity will show up here."
                  compact
                />
              </div>
            ) : (
              <ul>
                {notifications.map((n) => (
                  <li key={n.id}>
                    <button
                      onClick={() => !n.read && markAsRead(n.id)}
                      className="flex w-full flex-col items-start gap-0.5 border-b border-neutral-100 px-4 py-3 text-left last:border-0 hover:bg-neutral-50 dark:border-neutral-800/60 dark:hover:bg-neutral-800/50"
                    >
                      <div className="flex w-full items-center gap-2">
                        {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />}
                        <span className="text-sm font-medium">{n.title}</span>
                      </div>
                      <p className="text-xs text-neutral-500">{n.body}</p>
                      <span className="mt-1 text-[11px] text-neutral-400">
                        {n.createdAt ? formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true }) : ""}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
