import * as path from "node:path";
import fse from "fs-extra";
import PackageJson from "@npmcli/package-json";
import exitHook from "exit-hook";
import colors from "picocolors";

import type { ViteDevOptions } from "../vite/dev";
import type { ViteBuildOptions } from "../vite/build";
import { formatRoutes } from "../config/format";
import type { RoutesFormat } from "../config/format";
import { loadPluginContext } from "../vite/plugin";
import { transpile as convertFileToJS } from "./useJavascript";
import * as profiler from "../vite/profiler";
import * as Typegen from "../typegen";
import {
  importViteEsmSync,
  preloadViteEsm,
} from "../vite/import-vite-esm-sync";

export async function routes(
  reactBridgingRoot?: string,
  flags: {
    config?: string;
    json?: boolean;
  } = {}
): Promise<void> {
  let ctx = await loadPluginContext({
    root: reactBridgingRoot,
    configFile: flags.config,
  });

  if (!ctx) {
    console.error(
      colors.red("React Bridging Vite plugin not found in Vite config")
    );
    process.exit(1);
  }

  let format: RoutesFormat = flags.json ? "json" : "jsx";
  console.log(formatRoutes(ctx.reactBridgingConfig.routes, format));
}

export async function build(
  root?: string,
  options: ViteBuildOptions = {}
): Promise<void> {
  if (!root) {
    root = process.env.REACT_ROUTER_ROOT || process.cwd();
  }

  let { build } = await import("../vite/build");
  if (options.profile) {
    await profiler.start();
  }
  try {
    await build(root, options);
  } finally {
    await profiler.stop(console.info);
  }
}

export async function dev(root: string, options: ViteDevOptions = {}) {
  let { dev } = await import("../vite/dev");
  if (options.profile) {
    await profiler.start();
  }
  exitHook(() => profiler.stop(console.info));
  await dev(root, options);

  // keep `react-bridging dev` alive by waiting indefinitely
  await new Promise(() => {});
}

let clientEntries = ["entry.client.tsx", "entry.client.js", "entry.client.jsx"];
let serverEntries = ["entry.server.tsx", "entry.server.js", "entry.server.jsx"];
let entries = ["entry.client", "entry.server"];

let conjunctionListFormat = new Intl.ListFormat("en", {
  style: "long",
  type: "conjunction",
});

export async function generateEntry(
  entry: string,
  reactBridgingRoot: string,
  flags: {
    typescript?: boolean;
    config?: string;
  } = {}
) {
  let ctx = await loadPluginContext({
    root: reactBridgingRoot,
    configFile: flags.config,
  });

  let rootDirectory = ctx.rootDirectory;
  let appDirectory = ctx.reactBridgingConfig.appDirectory;

  // if no entry passed, attempt to create both
  if (!entry) {
    await generateEntry("entry.client", reactBridgingRoot, flags);
    await generateEntry("entry.server", reactBridgingRoot, flags);
    return;
  }

  if (!entries.includes(entry)) {
    let entriesArray = Array.from(entries);
    let list = conjunctionListFormat.format(entriesArray);

    console.error(
      colors.red(`Invalid entry file. Valid entry files are ${list}`)
    );
    return;
  }

  let pkgJson = await PackageJson.load(rootDirectory);
  let deps = pkgJson.content.dependencies ?? {};

  if (!deps["@react-bridging/node"]) {
    console.error(colors.red(`No default server entry detected.`));
    return;
  }

  let defaultsDirectory = path.resolve(
    path.dirname(require.resolve("@react-bridging/dev/package.json")),
    "dist",
    "config",
    "defaults"
  );
  let defaultEntryClient = path.resolve(defaultsDirectory, "entry.client.tsx");

  let defaultEntryServer = path.resolve(
    defaultsDirectory,
    `entry.server.node.tsx`
  );

  let isServerEntry = entry === "entry.server";

  let contents = isServerEntry
    ? await createServerEntry(rootDirectory, appDirectory, defaultEntryServer)
    : await createClientEntry(rootDirectory, appDirectory, defaultEntryClient);

  let useTypeScript = flags.typescript ?? true;
  let outputExtension = useTypeScript ? "tsx" : "jsx";
  let outputEntry = `${entry}.${outputExtension}`;
  let outputFile = path.resolve(appDirectory, outputEntry);

  if (!useTypeScript) {
    let javascript = convertFileToJS(contents, {
      cwd: rootDirectory,
      filename: isServerEntry ? defaultEntryServer : defaultEntryClient,
    });
    await fse.writeFile(outputFile, javascript, "utf-8");
  } else {
    await fse.writeFile(outputFile, contents, "utf-8");
  }

  console.log(
    colors.blue(
      `Entry file ${entry} created at ${path.relative(
        rootDirectory,
        outputFile
      )}.`
    )
  );
}

async function checkForEntry(
  rootDirectory: string,
  appDirectory: string,
  entries: string[]
) {
  for (let entry of entries) {
    let entryPath = path.resolve(appDirectory, entry);
    let exists = await fse.pathExists(entryPath);
    if (exists) {
      let relative = path.relative(rootDirectory, entryPath);
      console.error(colors.red(`Entry file ${relative} already exists.`));
      return process.exit(1);
    }
  }
}

async function createServerEntry(
  rootDirectory: string,
  appDirectory: string,
  inputFile: string
) {
  await checkForEntry(rootDirectory, appDirectory, serverEntries);
  let contents = await fse.readFile(inputFile, "utf-8");
  return contents;
}

async function createClientEntry(
  rootDirectory: string,
  appDirectory: string,
  inputFile: string
) {
  await checkForEntry(rootDirectory, appDirectory, clientEntries);
  let contents = await fse.readFile(inputFile, "utf-8");
  return contents;
}

export async function typegen(root: string, flags: { watch: boolean }) {
  root ??= process.cwd();

  if (flags.watch) {
    await preloadViteEsm();
    const vite = importViteEsmSync();
    const logger = vite.createLogger("info", { prefix: "[react-bridging]" });

    await Typegen.watch(root, { logger });
    await new Promise(() => {}); // keep alive
    return;
  }
  await Typegen.run(root);
}
