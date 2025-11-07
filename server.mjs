import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyCors from "@fastify/cors";
import fastifyHttpProxy from "@fastify/http-proxy";
import path from "path";
import { fileURLToPath } from "url";
import { createRequestHandler } from "@react-router/node";
import * as build from "./build/server/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({
    logger: true,
});

// ✅ Enable CORS
await fastify.register(fastifyCors, {
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});

// ✅ Serve static files
await fastify.register(fastifyStatic, {
    root: path.join(__dirname, "public"),
    prefix: "/static/",
    decorateReply: false,
    setHeaders(res) {
        res.setHeader("Cache-Control", "no-store");
    },
});

// ✅ Proxy API calls to backend (example: auth service)
await fastify.register(fastifyHttpProxy, {
    upstream: "http://auth-srv:3000",
    prefix: "/api",
    rewritePrefix: "/api",
    http2: false,
});

// ✅ Health check
fastify.get("/healthz", async () => ({ status: "ok" }));

// ✅ React Router SSR universal handler
fastify.route({
    method: ["GET", "POST", "PUT", "DELETE"],
    url: "/*",
    handler: async (req, reply) => {
        const handler = createRequestHandler({ build });
        const response = await handler(req.raw, {
            // Bridge Fastify’s request/response with the Web Fetch API
            request: {
                method: req.raw.method,
                headers: req.headers,
                body: req.raw,
                url: `${req.protocol}://${req.hostname}${req.raw.url}`,
            },
        });

        reply.status(response.status);
        for (const [key, value] of response.headers.entries()) {
            reply.header(key, value);
        }
        const body = await response.text();
        reply.send(body);
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
