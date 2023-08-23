import { defineConfig } from "tsup";

export default defineConfig({
  outDir: "esm",
  entry: ["src/index.ts"],
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
});
