import react from "@vitejs/plugin-react"
import { defineConfig, splitVendorChunkPlugin } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig(({ mode }) => {
  return {
    plugins: [react(), tsconfigPaths(), splitVendorChunkPlugin()],
    esbuild: {
      drop: ["console", "debugger"],
    },
  }
})
