import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyCors from "@fastify/cors";
import path from "path";
import { fileURLToPath } from "url";
import { createRequestHandler } from "@react-router/express";
import * as build from "./build/server/index.js";
import fastifyHttpProxy from "@fastify/http-proxy";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({
    logger: true,
});

// ✅ Enable CORS (GET, POST, PUT, DELETE, OPTIONS)
await fastify.register(fastifyCors, {
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});

// ✅ Serve static assets (React build + public)
await fastify.register(fastifyStatic, {
    root: path.join(__dirname, "public"),
    prefix: "/",
    decorateReply: false, // prevents sendFile redeclaration
    setHeaders(res) {
        // No cache while in active development
        res.setHeader("Cache-Control", "no-store");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
    },
});
await fastify.register(fastifyHttpProxy, {
    upstream: "http://auth-srv:3000",
    prefix: "/api", // forward all /api/* calls
    rewritePrefix: "/api",
});
// ✅ Health check route
fastify.get("/healthz", async () => ({ status: "ok" }));

// ✅ Catch-all route for React Router SSR
fastify.route({
    method: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    url: "/*",
    handler: async (req, reply) => {
        const handler = createRequestHandler({ build });
        handler(req.raw, reply.raw);
    },
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
fastify.listen({ port: PORT, host: "0.0.0.0" }, (err) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info(`🚀 Server listening on port ${PORT}`);
});
