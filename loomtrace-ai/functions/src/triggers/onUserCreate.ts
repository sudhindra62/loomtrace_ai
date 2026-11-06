import { auth } from "firebase-functions/v1";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";
import { computeEventHash } from "../lib/hashChain";

if (getApps().length === 0) initializeApp();

/**
 * Runs immediately after a new Firebase Auth user is created (i.e. right
 * after registerWithEmail() on the client succeeds).
 *
 * Why this has to be a Cloud Function and not just done in the Route
 * Handler that handles registration: account creation in this app happens
 * client-side (createUserWithEmailAndPassword), not via a server route —
 * that's a deliberate choice so Firebase's own client SDK handles the
 * sign-up UX (rate limiting, email format checks) rather than us
 * reimplementing it. But that means the *server* only finds out a user
 * was created via this trigger, which is exactly where the security-
 * critical custom claim needs to be set — never left to the client.
 *
 * Reads users/{uid}.requestedRole (set client-side, see auth.service.ts)
 * but only ever assigns 'weaver' or 'buyer' — this function is the
 * second enforcement point (alongside the registerSchema Zod enum and
 * the set-role Route Handler's admin gate) that makes privilege
 * escalation via public registration structurally impossible, not just
 * discouraged by a form field.
 */
export const onUserCreate = auth.user().onCreate(async (user) => {
  const db = getFirestore();
  const userDoc = await db.collection("users").doc(user.uid).get();
  const requestedRole = userDoc.data()?.requestedRole;

  const role = requestedRole === "weaver" || requestedRole === "buyer" ? requestedRole : "buyer";

  await getAuth().setCustomUserClaims(user.uid, { role });

  await db.collection("users").doc(user.uid).set(
    { role, updatedAt: FieldValue.serverTimestamp() },
    { merge: true }
  );

  // If the user registered as a weaver, seed their weaverIdentities/{uid}
  // snapshot document + the first lifecycle event — this is what makes
  // "Living Digital Identity" (Rev 3 §7) start at registration, not at
  // some later "complete your profile" step that a user might skip.
  if (role === "weaver") {
    const weaverRef = db.collection("weaverIdentities").doc(user.uid);
    await weaverRef.set({
      userId: user.uid,
      verificationStatus: "unverified",
      skills: [],
      craftSpecializations: [],
      experienceYears: 0,
      reputationScore: 0,
      cooperativeMemberships: [],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    const registeredEvent = { type: "registered", payload: {}, timestampMillis: Date.now() };
    const eventHash = computeEventHash(registeredEvent, null);

    await weaverRef.collection("identityEvents").add({
      type: "registered",
      payload: {},
      actorId: user.uid,
      timestamp: FieldValue.serverTimestamp(),
      prevEventHash: null,
      eventHash,
    });
  }

  await db.collection("auditLogs").add({
    actorId: "system",
    action: "user_registered",
    targetType: "user",
    targetId: user.uid,
    metadata: { role },
    timestamp: FieldValue.serverTimestamp(),
  });
});
