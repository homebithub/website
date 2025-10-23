import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    reactRouter(),
    tsconfigPaths(),
  ],
  build: {
    target: "es2022",
    minify: "esbuild",
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
      "@headlessui/react",
      "@heroicons/react/24/outline",
      "@heroicons/react/24/solid",
      "framer-motion",
      "lucide-react",
    ],
    exclude: ["@tinymce/tinymce-react"], // Large library that doesn't need pre-bundling
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
