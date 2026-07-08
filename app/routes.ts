import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("t/:slug", "routes/share.tsx"),
  route("docs", "routes/docs.tsx"),
] satisfies RouteConfig;
