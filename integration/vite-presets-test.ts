import fs from "node:fs/promises";
import * as path from "node:path";
import URL from "node:url";
import { expect } from "@playwright/test";
import { normalizePath } from "vite";
import dedent from "dedent";

import { build, test, createProject } from "./helpers/vite.js";

const js = String.raw;

const files = {
  "react-bridging.config.ts": dedent(js`
    import fs from "node:fs/promises";
    import serializeJs from "serialize-javascript";

    let isDeepFrozen = (obj: any) =>
      Object.isFrozen(obj) &&
      Object.keys(obj).every(
        prop => typeof obj[prop] !== 'object' || obj[prop] === null || isDeepFrozen(obj[prop])
      );

    export default {
      // Ensure user config takes precedence over preset config
      appDirectory: "app",
      
      presets: [
        // Ensure user config is passed to reactBridgingConfig hook
        {
          name: "test-preset",
          reactBridgingConfig: async ({ reactBridgingUserConfig: { presets, ...restUserConfig } }) => {
            if (!Array.isArray(presets)) {
              throw new Error("React Bridging user config doesn't have presets array.");
            }

            let expected = JSON.stringify({ appDirectory: "app"});
            let actual = JSON.stringify(restUserConfig);

            if (actual !== expected) {
              throw new Error([
                "React Bridging user config wasn't passed to reactBridgingConfig hook.",
                "Expected: " + expected,
                "Actual: " + actual,
              ].join(" "));
            }

            return {};
          },
        },

        // Ensure preset config takes lower precedence than user config
        {
          name: "test-preset",
          reactBridgingConfig: async () => ({
            appDirectory: "INCORRECT_APP_DIR", // This is overridden by the user config further down this file
          }),
        },
        {
          name: "test-preset",
          reactBridgingConfigResolved: async ({ reactBridgingConfig }) => {
            if (reactBridgingConfig.appDirectory.includes("INCORRECT_APP_DIR")) {
              throw new Error("React Bridging preset config wasn't overridden with user config");
            }
          }
        },

        // Ensure config presets are merged in the correct order
        {
          name: "test-preset",
          reactBridgingConfig: async () => ({
            buildDirectory: "INCORRECT_BUILD_DIR",
          }),
        },
        {
          name: "test-preset",
          reactBridgingConfig: async () => ({
            buildDirectory: "build",
          }),
        },

        // Ensure reactBridgingConfig is called with a frozen user config
        {
          name: "test-preset",
          reactBridgingConfig: async ({ reactBridgingUserConfig }) => {
            await fs.writeFile("PRESET_REACT_BRIDING_CONFIG_META.json", JSON.stringify({
              reactBridgingUserConfigFrozen: isDeepFrozen(reactBridgingUserConfig),
            }), "utf-8");
          }
        },

        // Ensure reactBridgingConfigResolved is called with a frozen config
        {
          name: "test-preset",
          reactBridgingConfigResolved: async ({ reactBridgingConfig }) => {
            await fs.writeFile("PRESET_REACT_BRIDING_CONFIG_RESOLVED_META.json", JSON.stringify({
              reactBridgingUserConfigFrozen: isDeepFrozen(reactBridgingConfig),
            }), "utf-8");
          }
        },

        // Ensure presets can set serverBundles option (this is critical for Vercel support)
        {
          name: "test-preset",
          reactBridgingConfig: async () => ({
            serverBundles() {
              return "preset-server-bundle-id";
            },
          }),
        },

        // Ensure presets can set buildEnd option (this is critical for Vercel support)
        {
          name: "test-preset",
          reactBridgingConfig: async () => ({
            async buildEnd(buildEndArgs) {
              let { viteConfig, buildManifest, reactBridgingConfig } = buildEndArgs;

              await fs.writeFile(
                "BUILD_END_META.js",
                [
                  "export const keys = " + JSON.stringify(Object.keys(buildEndArgs)) + ";",
                  "export const buildManifest = " + serializeJs(buildManifest, { space: 2, unsafe: true }) + ";",
                  "export const reactBridgingConfig = " + serializeJs(reactBridgingConfig, { space: 2, unsafe: true }) + ";",
                  "export const assetsDir = " + JSON.stringify(viteConfig.build.assetsDir) + ";",
                ].join("\\n"),
                "utf-8"
              );
            },
          }),
        },
      ],
    }
  `),
  "vite.config.ts": dedent(js`
    import { reactBridging } from "@react-bridging/dev/vite";

    export default {
      build: {
        assetsDir: "custom-assets-dir",
      },
      plugins: [reactBridging()],
    }
  `),
};

test("Vite / presets", async () => {
  let cwd = await createProject(files);
  let { status, stderr } = build({ cwd });
  expect(stderr.toString()).toBeFalsy();
  expect(status).toBe(0);

  function pathStartsWithCwd(pathname: string) {
    return normalizePath(pathname).startsWith(normalizePath(cwd));
  }

  function relativeToCwd(pathname: string) {
    return normalizePath(path.relative(cwd, pathname));
  }

  let buildEndArgsMeta: any = await import(
    URL.pathToFileURL(path.join(cwd, "BUILD_END_META.js")).href
  );

  let { reactBridgingConfig } = buildEndArgsMeta;

  // Smoke test Vite config
  expect(buildEndArgsMeta.assetsDir).toBe("custom-assets-dir");

  // Before rewriting to relative paths, assert that paths are absolute within cwd
  expect(pathStartsWithCwd(reactBridgingConfig.buildDirectory)).toBe(true);

  // Rewrite path args to be relative and normalized for snapshot test
  reactBridgingConfig.buildDirectory = relativeToCwd(
    reactBridgingConfig.buildDirectory
  );

  // Ensure preset configs are merged in correct order, resulting in the correct build directory
  expect(reactBridgingConfig.buildDirectory).toBe("build");

  // Ensure preset config takes lower precedence than user config
  expect(reactBridgingConfig.serverModuleFormat).toBe("esm");

  // Ensure `reactBridgingConfig` is called with a frozen user config
  expect(
    JSON.parse(
      await fs.readFile(
        path.join(cwd, "PRESET_REACT_BRIDING_CONFIG_META.json"),
        "utf-8"
      )
    )
  ).toEqual({
    reactBridgingUserConfigFrozen: true,
  });

  // Ensure `reactBridgingConfigResolved` is called with a frozen config
  expect(
    JSON.parse(
      await fs.readFile(
        path.join(cwd, "PRESET_REACT_BRIDING_CONFIG_RESOLVED_META.json"),
        "utf-8"
      )
    )
  ).toEqual({
    reactBridgingUserConfigFrozen: true,
  });

  // Snapshot the buildEnd args keys
  expect(buildEndArgsMeta.keys).toEqual([
    "buildManifest",
    "reactBridgingConfig",
    "viteConfig",
  ]);

  // Smoke test the resolved config
  expect(Object.keys(reactBridgingConfig)).toEqual([
    "appDirectory",
    "basename",
    "buildDirectory",
    "buildEnd",
    "future",
    "prerender",
    "routes",
    "serverBuildFile",
    "serverBundles",
    "serverModuleFormat",
    "ssr",
  ]);

  // Ensure we get a valid build manifest
  expect(buildEndArgsMeta.buildManifest).toEqual({
    routeIdToServerBundleId: {
      "routes/_index": "preset-server-bundle-id",
    },
    routes: {
      root: {
        file: "app/root.tsx",
        id: "root",
        path: "",
      },
      "routes/_index": {
        file: "app/routes/_index.tsx",
        id: "routes/_index",
        index: true,
        parentId: "root",
      },
    },
    serverBundles: {
      "preset-server-bundle-id": {
        file: "build/server/preset-server-bundle-id/index.js",
        id: "preset-server-bundle-id",
      },
    },
  });
});
