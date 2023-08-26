import { defineConfig } from "tsup";
import { polyfillNode } from "esbuild-plugin-polyfill-node";

export default defineConfig({
  outDir: "esm",
  entry: ["src/index.ts"],
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
  esbuildPlugins: [
    polyfillNode({
      globals: false,
    }),
  ],
  treeshake: true,
});
