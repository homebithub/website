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

// Expose website/SSR time independently from CDN and ingress time. This makes
// a browser trace answer whether a slow navigation was spent in this process
// or before the request reached it.
app.use((req, res, next) => {
    const startedAt = process.hrtime.bigint();
    const writeHead = res.writeHead;
    res.writeHead = function timedWriteHead(...args) {
        const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
        if (!res.headersSent) {
            res.setHeader("Server-Timing", `website;dur=${durationMs.toFixed(1)}`);
            res.setHeader("X-Response-Time", `${durationMs.toFixed(1)}ms`);
        }
        return writeHead.apply(this, args);
    };
    next();
});

// Compress all HTTP responses (gzip/deflate)
app.use(compression());

const defaultAllowedOrigins = [
    "https://homebit.co.ke",
    "https://www.homebit.co.ke",
    "https://api.homebit.co.ke",
    "https://preprod.homebit.co.ke",
    "https://preprod-api.homebit.co.ke",
    "https://hba.homebit.co.ke",
    "https://admin.homebit.co.ke",
];

const allowedOrigins = new Set([
    ...defaultAllowedOrigins,
    ...(process.env.CORS_ALLOWED_ORIGINS || "")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
]);

function isAllowedOrigin(origin) {
    if (allowedOrigins.has(origin)) {
        return true;
    }

    try {
        const url = new URL(origin);
        return url.protocol === "https:" && (
            url.hostname === "homebit.co.ke" ||
            url.hostname.endsWith(".homebit.co.ke")
        );
    } catch {
        return false;
    }
}

function logDeniedCorsOrigin(origin) {
    console.warn("CORS origin denied", { origin });
}

// Enable CORS with restricted origins
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g., mobile apps, Postman)
        if (!origin) {
            return callback(null, true);
        }

        // In development, allow localhost
        if (process.env.NODE_ENV !== "production") {
            if (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
                return callback(null, true);
            }
        }

        if (isAllowedOrigin(origin)) {
            callback(null, true);
        } else {
            logDeniedCorsOrigin(origin);
            callback(null, false);
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
}));

// Health checks (support both /health and /healthz for compatibility with probes)
app.get("/health", (req, res) => res.json({ status: "ok" }));
app.get("/healthz", (req, res) => res.json({ status: "ok" }));

/**
 * Where auth's own REST API lives, for this environment.
 *
 * This was the bare string "http://auth-srv:3000" — production's service name,
 * hardcoded. In a preprod pod that resolves to production's auth (a different
 * cluster IP entirely), so anything this forwarded left preprod and arrived at
 * the live service, bypassing the gateway on the way.
 *
 * Derived from AUTH_GRPC_BASE_URL, which every environment already sets to its
 * own auth, so the two halves of this service cannot end up talking to
 * different environments.
 */
function authRestTarget() {
    const explicit = (process.env.AUTH_REST_BASE_URL || "").trim();
    if (explicit) return explicit.replace(/\/$/, "");

    const grpc = (process.env.AUTH_GRPC_BASE_URL || "").trim();
    if (grpc) {
        try {
            // The gRPC address names a headless service on 5004; the REST API is
            // the ordinary service on 3000.
            const host = new URL(grpc).hostname.replace(/-headless$/, "");
            return `http://${host}:3000`;
        } catch {
            // Fall through to the default below.
        }
    }

    return "http://auth-srv:3000";
}

const backendApiProxy = createProxyMiddleware({
    target: authRestTarget(),
    changeOrigin: true,
    pathRewrite: {
        "^/api": "/api",
    },
});

/**
 * Forward only auth's own REST namespace.
 *
 * This used to forward everything under /api except a hand-written list of the
 * website's own routes — a duplicate of the routes directory that had to be
 * edited every time a route was added, and was not. /api/saved-filters and
 * /api/work-outcome were both missing from it, so in every deployed
 * environment they were proxied to auth, which has no such endpoints, and
 * answered 404. Both worked locally, where no proxy runs at all.
 *
 * Inverted, the rule needs no list: auth's REST API is versioned under /api/v1,
 * the website's routes are not, and a new website route works by existing.
 */
app.use("/api", (req, res, next) => {
    const pathname = new URL(req.originalUrl, "http://localhost").pathname;
    if (!pathname.startsWith("/api/v1/")) {
        return next();
    }

    return backendApiProxy(req, res, next);
});

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
