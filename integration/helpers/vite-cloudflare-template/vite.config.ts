import { reactBridging } from "@react-bridging/dev/vite";
import { cloudflareDevProxy } from "@react-bridging/dev/vite/cloudflare";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [cloudflareDevProxy(), reactBridging()],
});
