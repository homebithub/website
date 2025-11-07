// server.mjs
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyCors from "@fastify/cors";
import path from "path";
import { fileURLToPath } from "url";
import { createRequestHandler } from "@react-router/express"; // React Router SSR
import * as build from "./build/server/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({
    logger: true,
});

// ✅ Register CORS first
await fastify.register(fastifyCors, {
    origin: true,
    methods: ["GET", "POST", "OPTIONS","DELETE","PUT"],
});

// ✅ Register static files (only once per decorator!)
await fastify.register(fastifyStatic, {
    root: path.join(__dirname, "public"),
    prefix: "/",
    decorateReply: false, // prevents duplicate .sendFile() decorator
    setHeaders(res) {
        res.setHeader("Cache-Control", "public, max-age=3600");
    },
});

// ✅ Health endpoint (same as Express)
fastify.get("/healthz", async () => ({ status: "ok" }));

// ✅ Catch-all handler for React Router SSR
// Use `fastify.route` instead of `all()` to avoid duplicate OPTIONS routes
fastify.route({
    method:["GET", "POST", "OPTIONS","DELETE","PUT"],
    url: "/*",
    handler: async (req, reply) => {
        const handler = createRequestHandler({ build });
        handler(req.raw, reply.raw);
    },
});

// ✅ Start the server
const PORT = process.env.PORT || 3000;
fastify.listen({ port: PORT, host: "0.0.0.0" }, async (err) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }

    if (process.env.NODE_ENV === "development") {
        broadcastDevReady(build);
    }

    fastify.log.info(`🚀 Server listening on port ${PORT}`);
});
