import { type RouteConfig, index, route } from "@react-bridging/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("products/:id", "routes/product.tsx"),
] satisfies RouteConfig;
