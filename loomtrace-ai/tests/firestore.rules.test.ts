import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { readFileSync } from "node:fs";
import { doc, setDoc, updateDoc, getDoc, addDoc, collection } from "firebase/firestore";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "loomtrace-test",
    firestore: { rules: readFileSync("firestore.rules", "utf8"), host: "127.0.0.1", port: 8080 },
  });
});

afterAll(async () => testEnv.cleanup());
beforeEach(async () => testEnv.clearFirestore());

describe("firestore.rules — role model", () => {
  it("denies a buyer from writing to another user's products", async () => {
    const buyer = testEnv.authenticatedContext("buyer-1", { role: "buyer" });
    await assertFails(
      setDoc(doc(buyer.firestore(), "products/p1"), { weaverId: "someone-else", title: "x", status: "draft" })
    );
  });

  it("allows a weaver to create their own product", async () => {
    const weaver = testEnv.authenticatedContext("weaver-1", { role: "weaver" });
    await assertSucceeds(
      setDoc(doc(weaver.firestore(), "products/p1"), { weaverId: "weaver-1", title: "x", status: "draft" })
    );
  });

  it("denies a client from setting its own 'role' field on the users collection", async () => {
    const user = testEnv.authenticatedContext("user-1", { role: "buyer" });
    await assertFails(setDoc(doc(user.firestore(), "users/user-1"), { role: "admin" }));
  });

  it("denies an unauthenticated write to auditLogs (server-only collection)", async () => {
    const anon = testEnv.unauthenticatedContext();
    await assertFails(addDoc(collection(anon.firestore(), "auditLogs"), { action: "x" }));
  });

  it("allows anonymous read of a published productIdentity (public QR verification)", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "productIdentities/dpi-1"), { weaverId: "weaver-1", status: "active" });
    });
    const anon = testEnv.unauthenticatedContext();
    await assertSucceeds(getDoc(doc(anon.firestore(), "productIdentities/dpi-1")));
  });
});

describe("firestore.rules — lifecycle event immutability", () => {
  it("allows creating a lifecycle event", async () => {
    const weaver = testEnv.authenticatedContext("weaver-1", { role: "weaver" });
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "productIdentities/dpi-1"), { weaverId: "weaver-1", status: "active" });
    });
    await assertSucceeds(
      addDoc(collection(weaver.firestore(), "productIdentities/dpi-1/lifecycleEvents"), {
        type: "registered",
        payload: {},
        timestamp: new Date(),
      })
    );
  });

  it("denies updating an existing lifecycle event — this is the tamper-evidence guarantee", async () => {
    const weaver = testEnv.authenticatedContext("weaver-1", { role: "weaver" });
    let eventId = "";
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "productIdentities/dpi-1"), { weaverId: "weaver-1", status: "active" });
      const ref = await addDoc(collection(ctx.firestore(), "productIdentities/dpi-1/lifecycleEvents"), {
        type: "registered",
        payload: {},
      });
      eventId = ref.id;
    });

    await assertFails(
      updateDoc(doc(weaver.firestore(), `productIdentities/dpi-1/lifecycleEvents/${eventId}`), { type: "tampered" })
    );
  });
});
