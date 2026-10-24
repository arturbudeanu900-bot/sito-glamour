import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// `vite build --mode artifact` produce un unico HTML autosufficiente (JS e CSS inline).
export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === "artifact" ? [viteSingleFile()] : [])],
  build: mode === "artifact" ? { outDir: "dist-artifact", emptyOutDir: true } : undefined,
}));
