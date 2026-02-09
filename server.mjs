import express from "express";
import compression from "compression";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";
import { createRequestHandler } from "@react-router/express";
import path from "path";
import { fileURLToPath } from "url";
import * as build from "./build/server/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BUILD_CLIENT_DIR = path.join(__dirname, "build", "client");

const app = express();

// Compress all HTTP responses (gzip/deflate)
app.use(compression());

// Enable CORS
app.use(cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
}));

// Health checks (support both /health and /healthz for compatibility with probes)
app.get("/health", (req, res) => res.json({ status: "ok" }));
app.get("/healthz", (req, res) => res.json({ status: "ok" }));

// Proxy backend API calls
app.use("/api", createProxyMiddleware({
    target: "http://auth-srv:3000",
    changeOrigin: true,
    pathRewrite: {
        "^/api": "/api",
    },
}));

// Serve static assets from build/client (includes /assets/* and root files like favicon, images, etc.)
app.use(express.static(BUILD_CLIENT_DIR, {
    index: false, // Don't serve index.html automatically
    setHeaders: (res, filePath) => {
        // Cache static assets but not HTML
        if (filePath.endsWith('.js') || filePath.endsWith('.css') || filePath.endsWith('.woff2')) {
            res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else {
            res.setHeader("Cache-Control", "no-store");
        }
    },
}));

// React Router SSR handler - must be last
app.all("*", createRequestHandler({ 
    build,
    mode: process.env.NODE_ENV || "production"
}));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
    // Log to stderr instead of stdout to avoid any potential output issues
    console.error(`🚀 Express SSR server running on port ${PORT}`);
});
