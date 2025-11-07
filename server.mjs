import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyCors from "@fastify/cors";
import fastifyHttpProxy from "@fastify/http-proxy";
import path from "path";
import { fileURLToPath } from "url";
import { createRequestHandler } from "@react-router/express";
import * as build from "./build/server/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({
    logger: true,
});

// ✅ Enable CORS (GET, POST, PUT, DELETE, OPTIONS)
await fastify.register(fastifyCors, {
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
});

// ✅ Serve static assets from React build/public
await fastify.register(fastifyStatic, {
    root: path.join(__dirname, "public"),
    prefix: "/static/", // 🔧 changed from "/" to avoid conflict
    decorateReply: false,
    setHeaders(res) {
        res.setHeader("Cache-Control", "no-store");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
    },
});

// ✅ Proxy API requests to Go backend service
await fastify.register(fastifyHttpProxy, {
    upstream: "http://auth-srv:3000",
    prefix: "/api",
    rewritePrefix: "/api",
    http2: false,
});

// ✅ Health check
fastify.get("/healthz", async () => ({ status: "ok" }));

// ✅ React Router SSR handler (catch-all)
fastify.all("/*", async (req, reply) => {
    const handler = createRequestHandler({ build });
    handler(req.raw, reply.raw);
});

const PORT = process.env.PORT || 3000;
fastify.listen({ port: PORT, host: "0.0.0.0" }, (err) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info(`🚀 Server listening on port ${PORT}`);
});
