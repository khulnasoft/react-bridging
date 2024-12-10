import type { RouterProviderProps } from "react-bridging/dom";
import { HydratedRouter, RouterProvider } from "react-bridging/dom";

// TODO: Confirm if this causes tree-shaking issues and if so, convert to named exports
export type * from "react-bridging";
export * from "react-bridging";

export type { RouterProviderProps };
export { HydratedRouter, RouterProvider };
