import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "shared-core": path.resolve(__dirname, "../../packages/shared-core"),
      "shared-ui": path.resolve(__dirname, "../../packages/shared-ui"),
    },
  },
  server: {
    port: 3000,
  },
});
