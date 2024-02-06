import { polyfillNode } from "esbuild-plugin-polyfill-node";
import { defineConfig, Options } from "tsup";

const esm: Options = {
  format: ["esm"],
  outDir: "dist/esm",
  entry: ["src/index.ts"],
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
  esbuildPlugins: [
    polyfillNode({
      globals: {
        global: true,
        buffer: true,
        process: true,
      },
      polyfills: {
        crypto: true,
        buffer: true,
      },
    }),
  ],
  treeshake: true,
};

const cjs: Options = {
  format: ["cjs"],
  entry: ["src/index.ts"],
  outDir: "dist/cjs",
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
  legacyOutput: true,
  treeshake: true,
};

export default defineConfig([esm, cjs]);
