import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyCors from "@fastify/cors";
import fastifyHttpProxy from "@fastify/http-proxy";
import path from "path";
import { fileURLToPath } from "url";
import * as build from "./build/server/index.js";
import { createRequestHandler } from "@react-router/express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({ logger: true });

// Enable CORS
await fastify.register(fastifyCors, {
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});

// Serve static assets from a dedicated prefix
await fastify.register(fastifyStatic, {
    root: path.join(__dirname, "public"),
    prefix: "/assets/", // only /assets/* is handled here
    decorateReply: false,
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

// Health check
fastify.get("/healthz", async () => ({ status: "ok" }));

// Universal React Router handler
const handleRequest = createRequestHandler({ build });

fastify.all("/*", async (req, reply) => {
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
