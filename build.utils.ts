export function createBanner(packageName: string, version: string) {
  return `/**
 * ${packageName} v${version}
 *
 * Copyright (c) KhulnaSoft Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */`;
}
