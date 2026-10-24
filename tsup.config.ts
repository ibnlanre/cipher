import { defineConfig } from "tsup";

/**
 * ESM and CommonJS builds. `@noble/ciphers` is bundled (it is ESM-only), so the
 * package has no runtime dependencies and the CommonJS build works too.
 */
const shared = {
  minify: true,
  noExternal: ["@noble/ciphers"],
  outDir: "dist",
  target: "es2020",
  treeshake: true,
} as const;

export default defineConfig([
  { ...shared, clean: true, dts: true, entry: { index: "src/index.ts" }, format: "esm" },
  // The CommonJS module is the class itself; its types are the ESM ones.
  { ...shared, dts: { entry: { index: "src/index.ts" } }, entry: { index: "src/cjs.cts" }, format: "cjs" },
]);
