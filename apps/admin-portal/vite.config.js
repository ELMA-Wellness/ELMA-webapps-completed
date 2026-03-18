import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@shared-ui": path.resolve(__dirname, "../../packages/shared-ui"),
      "@shared-core": path.resolve(__dirname, "../../packages/shared-core"),
    },
  },
  server: {
    middlewareMode: false, 
    historyApiFallback: true, 
  },
});
