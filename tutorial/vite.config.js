import * as path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import rollupReplace from "@rollup/plugin-replace";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    rollupReplace({
      preventAssignment: true,
      values: {
        "process.env.NODE_ENV": JSON.stringify("development"),
      },
    }),
    react(),
  ],
  resolve: process.env.USE_SOURCE
    ? {
        alias: {
          "react-bridging": path.resolve(
            __dirname,
            "../../packages/react-bridging/index.tsx"
          ),
          "react-bridging-dom": path.resolve(
            __dirname,
            "../../packages/react-bridging-dom/index.tsx"
          ),
        },
      }
    : {},
});
