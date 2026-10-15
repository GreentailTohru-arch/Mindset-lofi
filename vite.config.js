import { defineConfig } from "vite";
export default defineConfig({
  base: "./",
  server: { host: "127.0.0.1", port: 5173, strictPort: true },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: { input: { main: "index.html", matrix: "art-matrix.html" }, output: { manualChunks: { three: ["three"] } } },
  },
});
