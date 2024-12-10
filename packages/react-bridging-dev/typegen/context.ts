import type {
  ConfigLoader,
  ResolvedReactBridgingConfig,
} from "../config/config";

export type Context = {
  rootDirectory: string;
  configLoader: ConfigLoader;
  config: ResolvedReactBridgingConfig;
};
