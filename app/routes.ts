import { type RouteConfig } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

// Using flat-routes convention for file-based routing
// This will automatically discover all route files in app/routes
export default flatRoutes() satisfies RouteConfig;
