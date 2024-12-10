import { reactBridging } from "@react-bridging/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [reactBridging(), tsconfigPaths()],
});
