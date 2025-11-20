import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyCors from "@fastify/cors";
import fastifyHttpProxy from "@fastify/http-proxy";
import path from "path";
import { fileURLToPath } from "url";
import fs from "node:fs";
import * as build from "./build/server/index.js";

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
    // Create a proper Web Request from Fastify request
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
    const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
    const url = new URL(req.raw.url, `${protocol}://${host}`);
    
    const webRequest = new Request(url.toString(), {
        method: req.method,
        headers: new Headers(req.headers),
        body: req.method !== "GET" && req.method !== "HEAD" ? req.raw : undefined,
    });

    try {
        // React Router v7 uses build.module.default.fetch
        const handler = build.module.default || build.default;
        const response = await handler.fetch(webRequest, {
            context: {},
        });
        
        reply.status(response.status);
        for (const [key, value] of response.headers.entries()) {
            reply.header(key, value);
        }
        
        const body = await response.text();
        reply.send(body);
    } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({ error: "Internal Server Error", message: error.message });
    }
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
