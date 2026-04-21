import { reactRouter } from "@react-router/dev/vite";
import { defineConfig, type Plugin } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * Vite plugin: transform CJS require() in generated gRPC-Web stubs to ESM imports.
 *
 * The protoc-gen-grpc-web codegen emits CommonJS. Vite serves app source files
 * as ESM in both browser dev and SSR dev, so bare `require()` calls crash with
 * "require is not defined". The production build is fine because Rollup's
 * commonjsOptions already covers these files — this plugin only runs in serve.
 */
function grpcCjsPlugin(): Plugin {
  let isBuild = false;
  return {
    name: 'grpc-cjs-compat',
    enforce: 'pre',
    configResolved(config) {
      isBuild = config.command === 'build';
    },
    transform(code, id) {
      // Only run in dev serve — production build uses Rollup's commonjsOptions instead
      if (isBuild) return null;
      if (!id.includes('/grpc/generated/') || !id.endsWith('.js')) return null;

      // Collect all require() calls and replace with ESM import references
      const imports: string[] = [];
      let n = 0;

      let transformed = code.replace(
        /require\(['"]([^'"]+)['"]\)/g,
        (_match: string, mod: string) => {
          const alias = `__grpc_req_${n++}__`;
          imports.push(`import * as ${alias} from '${mod}';`);
          return `(${alias}.default ?? ${alias})`;
        },
      );

      if (imports.length === 0) return null;

      // Provide CJS `module` / `exports` shims so `module.exports = X` and
      // `goog.object.extend(exports, ...)` work in ESM context.
      const preamble = imports.join('\n') + '\n'
        + 'const module = { exports: {} };\n'
        + 'let exports = module.exports;\n';

      // Collect all ServiceClient constructor names so we can emit named
      // ESM re-exports (required for `import { FooClient } from '...'`).
      const seen = new Set<string>();
      const clientRe = /proto\.\w+\.(\w+(?:Client|PromiseClient))\s*=/g;
      let m;
      while ((m = clientRe.exec(code)) !== null) seen.add(m[1]);

      let epilogue = '\nconst __cjs_out__ = module.exports;\nexport default __cjs_out__;\n';
      if (seen.size > 0) {
        epilogue += [...seen].map(name =>
          `export const ${name} = __cjs_out__.${name};`
        ).join('\n') + '\n';
      }

      return { code: preamble + transformed + epilogue, map: null };
    },
  };
}

export default defineConfig({
  plugins: [
    grpcCjsPlugin(),
    reactRouter(),
    tsconfigPaths(),
  ],
  build: {
    target: "es2022",
    minify: "esbuild",
    commonjsOptions: {
      include: [/node_modules/, /app\/grpc\/generated/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Only apply manual chunks for client build (not SSR)
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor';
            }
            if (id.includes('chart.js') || id.includes('react-chartjs-2') || id.includes('chartjs-plugin-datalabels')) {
              return 'charts';
            }
            if (id.includes('@tinymce/tinymce-react')) {
              return 'editor';
            }
            if (id.includes('framer-motion') || id.includes('canvas-confetti')) {
              return 'animation';
            }
            if (id.includes('@headlessui/react') || id.includes('@heroicons/react') || id.includes('lucide-react')) {
              return 'ui';
            }
          }
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router",
      "react-router-dom",
      "@headlessui/react",
      "@heroicons/react/20/solid",
      "@heroicons/react/24/outline",
      "@heroicons/react/24/solid",
      "framer-motion",
      "lucide-react",
      "react-icons/fc",
      "joi",
      "google-protobuf",
      "google-protobuf/google/protobuf/struct_pb.js",
      "grpc-web",
      "web-vitals",
    ],
    exclude: ["@tinymce/tinymce-react"], // Large library that doesn't need pre-bundling
    // Force Vite to pre-bundle and transform generated gRPC files from CommonJS to ESM
    entries: [
      "app/services/grpc/auth.service.ts",
    ],
  },
  esbuild: {
    target: "es2022",
    logOverride: { "this-is-undefined-in-esm": "silent" },
  },
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: [".."],

    },

  },
});
