import { defineConfig } from "tsup";
import { polyfillNode } from "esbuild-plugin-polyfill-node";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "cjs",
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
  legacyOutput: true,
  esbuildPlugins: [polyfillNode()],
  treeshake: true
});
