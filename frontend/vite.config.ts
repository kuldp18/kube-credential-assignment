import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
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
});
