// import { flatRoutes } from "remix-flat-routes";
//
// export default   {
//   ignoredRouteFiles: ["**/.*"],
//   routes: async (defineRoutes) => {
//     return flatRoutes('/routes', defineRoutes);
//   },
// };
//


/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*"],
  serverModuleFormat: "esm",
  assetsBuildDirectory: "public/build",
  publicPath: "/build/",
  future: {
    v3_fetcherPersist: true,
    v3_relativeSplatPath: true,
    v3_throwAbortReason: true,
  },
  // Enable build optimizations
  serverDependenciesToBundle: [
    // Bundle these dependencies for better performance
    /^@headlessui\/.*/,
    /^@heroicons\/.*/,
    "lucide-react",
  ],
};
