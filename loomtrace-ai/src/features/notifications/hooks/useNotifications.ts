"use client";

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { typedConverter } from "@/lib/firebase/converters";
import type { AppNotification } from "@/types/models";

/**
 * Live-updating notification feed. Uses onSnapshot deliberately (not
 * React Query) — this is exactly the case called out in Phase 1 §2
 * ("Firestore's own onSnapshot used only where live updates matter,
 * e.g. notifications"), since a weaver should see a new order notice
 * without refreshing.
 */
export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "notifications").withConverter(typedConverter<AppNotification>()),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setNotifications(snapshot.docs.map((d) => d.data()));
        setLoading(false);
      },
      (error) => {
        console.error("[useNotifications] listener error", error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (notificationId: string) => {
    await updateDoc(doc(db, "notifications", notificationId), { read: true });
  };

  return { notifications, unreadCount, loading, markAsRead };
}
