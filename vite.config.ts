import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    remix({
      ignoredRouteFiles: ["**/.*"],
    }),
  ],
  build: {
    target: "es2022",
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate heavy libraries into their own chunks
          vendor: ["react", "react-dom"],
          charts: ["chart.js", "react-chartjs-2", "chartjs-plugin-datalabels"],
          editor: ["@tinymce/tinymce-react"],
          animation: ["framer-motion", "canvas-confetti"],
          ui: ["@headlessui/react", "@heroicons/react", "lucide-react"],
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
