import { test, expect } from "@playwright/test";
import dedent from "dedent";

import { createProject, build } from "./helpers/vite.js";

test.describe(() => {
  let cwd: string;
  let buildResult: ReturnType<typeof build>;

  test.beforeAll(async () => {
    cwd = await createProject({
      "vite.config.ts": dedent`
        import { reactBridging } from "@react-bridging/dev/vite";
        import mdx from "@mdx-js/rollup";

        export default {
          plugins: [
            reactBridging(),
            mdx(),
          ],
        }
      `,
    });

    buildResult = build({ cwd });
  });

  test("Vite / plugin order validation / MDX", () => {
    expect(buildResult.stderr.toString()).toContain(
      'Error: The "@mdx-js/rollup" plugin should be placed before the React Bridging plugin in your Vite config file'
    );
  });
});
