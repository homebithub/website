import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyCors from "@fastify/cors";
import fastifyHttpProxy from "@fastify/http-proxy";
import path from "path";
import { fileURLToPath } from "url";
import fs from "node:fs";
import * as build from "./build/server/index.js";
import { createRequestHandler } from "@react-router/express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, "public");

const fastify = Fastify({ logger: true });

// Enable CORS
await fastify.register(fastifyCors, {
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});

// Serve static assets from a dedicated prefix
await fastify.register(fastifyStatic, {
    root: PUBLIC_DIR,
    prefix: "/assets/", // static files served under /assets/*
    decorateReply: true, // enable reply.sendFile
    setHeaders(res) {
        res.setHeader("Cache-Control", "no-store");
    },
});

// Proxy backend API calls
await fastify.register(fastifyHttpProxy, {
    upstream: "http://auth-srv:3000",
    prefix: "/api",
    rewritePrefix: "/api",
    http2: false,
});

// Health checks (support both /health and /healthz for compatibility with probes)
fastify.get("/health", async () => ({ status: "ok" }));
fastify.get("/healthz", async () => ({ status: "ok" }));

// Universal React Router handler (SSR)
const handleRequest = createRequestHandler({ build });

// Use GET only, not all methods, to avoid OPTIONS conflicts with CORS
fastify.get("/*", async (req, reply) => {
    // First: if request maps to a real file in public/ at the root path, serve it
    try {
        const url = new URL(req.raw.url, `http://${req.headers.host || "localhost"}`);
        const pathname = decodeURIComponent(url.pathname || "/");
        if (
            pathname !== "/" &&
            !pathname.startsWith("/api") &&
            !pathname.startsWith("/assets/")
        ) {
            const rel = pathname.startsWith("/") ? pathname.slice(1) : pathname;
            const fullPath = path.join(PUBLIC_DIR, rel);
            if (fs.existsSync(fullPath)) {
                return reply.sendFile(rel);
            }
        }
    } catch {}

    // Otherwise fall back to SSR
    const response = await handleRequest(req.raw);
    reply.status(response.status);
    for (const [key, value] of response.headers.entries()) {
        reply.header(key, value);
    }
    const body = await response.text();
    reply.send(body);
});

// Start server
const PORT = process.env.PORT || 3000;
fastify.listen({ port: PORT, host: "0.0.0.0" }, (err) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info(`🚀 Fastify SSR server running on port ${PORT}`);
});
