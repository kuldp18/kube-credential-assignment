import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    testTimeout: 10000,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
  },
  server: {
    proxy: {
      "/issue": {
        target: "http://localhost:5000",
        changeOrigin: true,
        rewrite: () => `/api/services/issuance/issue`,
      },
      "/verify": {
        target: "http://localhost:5001",
        changeOrigin: true,
        rewrite: () => `/api/services/verification/verify`,
      },
    },
  },
} as UserConfig);
