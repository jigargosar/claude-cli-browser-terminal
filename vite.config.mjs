import { defineConfig } from "vite";

// Builds web/ with its browser libraries into dist/, which server.mjs serves.
export default defineConfig({
  root: "web",
  build: { outDir: "../dist", emptyOutDir: true },
});
