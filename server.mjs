import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";
import { createRequestHandler } from "@react-router/express";
import path from "path";
import { fileURLToPath } from "url";
import * as build from "./build/server/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, "public");

const app = express();

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

// Serve static assets from /assets prefix
app.use("/assets", express.static(path.join(PUBLIC_DIR), {
    setHeaders: (res) => {
        res.setHeader("Cache-Control", "no-store");
    },
}));

// Serve other static files from public root (favicon, robots.txt, etc.)
app.use(express.static(PUBLIC_DIR, {
    index: false, // Don't serve index.html automatically
}));

// React Router SSR handler
app.all("*", createRequestHandler({ build }));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Express SSR server running on port ${PORT}`);
});
