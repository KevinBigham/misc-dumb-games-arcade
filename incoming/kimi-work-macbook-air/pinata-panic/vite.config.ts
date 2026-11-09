import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import gameBuildOutput from "./scripts/build-output.ts"
import { fileURLToPath } from "node:url"

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), gameBuildOutput()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(projectRoot, "./src"),
    },
  },
});
