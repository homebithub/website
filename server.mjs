import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyCors from "@fastify/cors";
import path from "path";
import { fileURLToPath } from "url";
import { createRequestHandler } from "@react-router/express";
import * as build from "./build/server/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({
    logger: true,
});

// ✅ CORS
await fastify.register(fastifyCors, {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
});

// ✅ Serve static assets from unique prefixes to avoid route overlap
await fastify.register(fastifyStatic, {
    root: [
        path.join(__dirname, "build/client/assets"),
        path.join(__dirname, "build/client"),
        path.join(__dirname, "public")
    ],
    prefix: "/", // serve everything from root
    setHeaders(res) {
        res.setHeader("Cache-Control", "no-store");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
    },
});


// ✅ Health check
fastify.get("/health", async () => ({ status: "ok" }));

// ✅ Catch-all React Router handler
fastify.all("/*", async (req, reply) => {
    const handler = createRequestHandler({ build });

    // Let Express-style handler process the raw Node request
    await handler(req.raw, reply.raw);

    // Tell Fastify the response was already handled
    reply.sent = true;
});

// ✅ Start server
const PORT = process.env.PORT || 3000;

try {
    await fastify.listen({ port: PORT, host: "0.0.0.0" });
    fastify.log.info(`✅ Server listening on port ${PORT}`);
} catch (err) {
    fastify.log.error(err);
    process.exit(1);
}
