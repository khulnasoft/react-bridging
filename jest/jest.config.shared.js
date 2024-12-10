const ignorePatterns = [
  "\\/build\\/",
  "\\/coverage\\/",
  "\\/\\.vscode\\/",
  "\\/\\.tmp\\/",
  "\\/\\.cache\\/",
];

/** @type {import('jest').Config} */
module.exports = {
  moduleNameMapper: {
    "@react-bridging/dev$": "<rootDir>/../react-bridging-dev/index.ts",
    "@react-bridging/express$": "<rootDir>/../react-bridging-express/index.ts",
    "@react-bridging/node$": "<rootDir>/../react-bridging-node/index.ts",
    "@react-bridging/serve$": "<rootDir>/../react-bridging-serve/index.ts",
    "^react-bridging$": "<rootDir>/../react-bridging/index.ts",
    "^@web3-storage/multipart-parser$": require.resolve(
      "@web3-storage/multipart-parser"
    ),
  },
  modulePathIgnorePatterns: ignorePatterns,
  testMatch: ["<rootDir>/**/*-test.[jt]s?(x)"],
  transform: {
    "\\.[jt]sx?$": require.resolve("./transform"),
  },
  watchPathIgnorePatterns: [...ignorePatterns, "\\/node_modules\\/"],
  globals: {
    __DEV__: true,
  },
};
