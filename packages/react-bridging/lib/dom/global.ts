import type { HydrationState, Router as DataRouter } from "../router/router";
import type { AssetsManifest, FutureConfig } from "./ssr/entry";
import type { RouteModules } from "./ssr/routeModules";

export type WindowReactBridgingContext = {
  basename?: string;
  state: HydrationState;
  criticalCss?: string;
  future: FutureConfig;
  isSpaMode: boolean;
  stream: ReadableStream<Uint8Array> | undefined;
  streamController: ReadableStreamDefaultController<Uint8Array>;
  // The number of active deferred keys rendered on the server
  a?: number;
  dev?: {
    port?: number;
    hmrRuntime?: string;
  };
};

export interface ViewTransition {
  finished: Promise<void>;
  ready: Promise<void>;
  updateCallbackDone: Promise<void>;
  skipTransition(): void;
}

declare global {
  // TODO: v7 - Can this go away in favor of "just use remix"?
  var __staticRouterHydrationData: HydrationState | undefined;
  // v6 SPA info
  var __reactBridgingVersion: string;
  interface Document {
    startViewTransition(cb: () => Promise<void> | void): ViewTransition;
  }
  var __reactBridgingContext: WindowReactBridgingContext | undefined;
  var __reactBridgingManifest: AssetsManifest | undefined;
  var __reactBridgingRouteModules: RouteModules | undefined;
  var __reactBridgingDataRouter: DataRouter | undefined;
  var __reactBridgingHdrActive: boolean;
  var __reactBridgingClearCriticalCss: (() => void) | undefined;
  var $RefreshRuntime$:
    | {
        performReactRefresh: () => void;
      }
    | undefined;
}

// https://stackoverflow.com/a/59499895
export {};
