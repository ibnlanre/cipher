import { defineConfig } from "tsup";

/**
 * One build, two formats. `@noble/ciphers` is bundled (it is ESM-only), so the
 * package has no runtime dependencies and the CommonJS build works too.
 */
export default defineConfig({
  clean: true,
  dts: true,
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  minify: true,
  noExternal: ["@noble/ciphers"],
  outDir: "dist",
  target: "es2020",
  treeshake: true,
});
