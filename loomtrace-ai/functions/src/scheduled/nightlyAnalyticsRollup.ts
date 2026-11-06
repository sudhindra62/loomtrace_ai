import { pubsub } from "firebase-functions/v1";
import { getFirestore, Timestamp, FieldValue } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";

if (getApps().length === 0) initializeApp();

/**
 * Runs daily. Writes one analyticsRollups/{period} document per day —
 * this is the read-optimized materialized view NHIC and the Impact
 * Dashboard query, per Phase 1 Rev 2 §5/§7 and the frozen BigQuery
 * decision (ARCHITECTURE_FREEZE.md §3): Firestore rollups run the MVP,
 * BigQuery is the noted future scale path, not built here.
 *
 * Deliberately simple aggregation (count queries over a 24h window) —
 * sufficient at MVP/demo scale. Revisit with a streaming aggregation
 * approach (e.g. counters maintained on write, per Phase 1 Rev 2 §7
 * "Problem 1") if daily full-collection scans become too slow/costly as
 * data volume grows.
 */
export const nightlyAnalyticsRollup = pubsub.schedule("every 24 hours").onRun(async () => {
  const db = getFirestore();
  const now = new Date();
  const period = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const windowStart = Timestamp.fromMillis(now.getTime() - 24 * 60 * 60 * 1000);

  const [ordersSnap, scansSnap, activeProductsSnap] = await Promise.all([
    db.collection("orders").where("createdAt", ">=", windowStart).get(),
    db.collection("qrScans").where("scannedAt", ">=", windowStart).get(),
    db.collection("products").where("updatedAt", ">=", windowStart).get(),
  ]);

  const activeWeaverIds = new Set(activeProductsSnap.docs.map((d) => d.data().weaverId));

  await db.collection("analyticsRollups").doc(period).set({
    period,
    orderVolume: ordersSnap.size,
    activeWeavers: activeWeaverIds.size,
    scanCount: scansSnap.size,
    computedAt: FieldValue.serverTimestamp(),
  });

  // Impact Dashboard (Phase 1 Rev 3 §1) reads impactMetrics — populated
  // from the same window to avoid a second aggregation pass over the
  // same collections.
  await db.collection("impactMetrics").doc(period).set({
    period,
    qrVerificationAdoption: scansSnap.size,
    marketplaceEngagement: ordersSnap.size,
    digitalAdoptionRate: activeWeaverIds.size,
    computedAt: FieldValue.serverTimestamp(),
  });
});
