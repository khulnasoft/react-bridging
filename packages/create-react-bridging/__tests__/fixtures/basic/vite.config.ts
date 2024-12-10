import { reactBridging } from "@react-bridging/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [reactBridging()],
});
