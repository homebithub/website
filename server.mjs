import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyCors from "@fastify/cors";
import path from "path";
import { fileURLToPath } from "url";
import { createRequestHandler } from "@react-router/express"; // React Router SSR handler
import * as build from "./build/server/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({
    logger: true,
});

await fastify.register(fastifyCors);

// ✅ Serve assets from specific prefixes to avoid route conflicts
fastify.register(fastifyStatic, {
    root: path.join(__dirname, "build/client/assets"),
    prefix: "/assets/",
    setHeaders(res) {
        res.setHeader("Cache-Control", "no-store");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
    },
});

fastify.register(fastifyStatic, {
    root: path.join(__dirname, "build/client"),
    prefix: "/client/",
    setHeaders(res) {
        res.setHeader("Cache-Control", "no-store");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
    },
});

fastify.register(fastifyStatic, {
    root: path.join(__dirname, "public"),
    prefix: "/public/",
    setHeaders(res) {
        res.setHeader("Cache-Control", "no-store");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
    },
});

// ✅ Health check
fastify.get("/healthz", async () => ({ status: "ok" }));

// ✅ Catch-all route — after all statics
fastify.all("/*", (req, reply) => {
    const handler = createRequestHandler({ build });
    handler(req.raw, reply.raw);
});

const PORT = process.env.PORT || 3000;

fastify.listen({ port: PORT, host: "0.0.0.0" }, (err) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info(`✅ Server listening on port ${PORT}`);
});
