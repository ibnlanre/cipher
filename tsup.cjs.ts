import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "cjs",
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
  legacyOutput: true,
});
