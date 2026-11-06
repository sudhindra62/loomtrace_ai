import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    exclude: ["tests/**"], // emulator-based rules tests run via a separate config, see vitest.integration.config.ts
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
