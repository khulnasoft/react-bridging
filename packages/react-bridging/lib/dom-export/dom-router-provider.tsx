import * as React from "react";
import * as ReactDOM from "react-dom";

import type { RouterProviderProps as BaseRouterProviderProps } from "react-bridging";
import { RouterProvider as BaseRouterProvider } from "react-bridging";

export type RouterProviderProps = Omit<BaseRouterProviderProps, "flushSync">;

export function RouterProvider(props: Omit<RouterProviderProps, "flushSync">) {
  return <BaseRouterProvider flushSync={ReactDOM.flushSync} {...props} />;
}
