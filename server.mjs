import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import { createRequestHandler } from "@react-router/express";
import path from "path";
import * as build from "./build/server/index.js";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = Fastify({
  logger: true,
});

// Enable CORS (dev-friendly)
await app.register(cors, { origin: true });

// Serve static assets — no caching for now
await app.register(fastifyStatic, {
  root: path.join(__dirname, "build/client/assets"),
  prefix: "/assets/",
  setHeaders: (res) => {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  },
});

await app.register(fastifyStatic, {
  root: path.join(__dirname, "build/client"),
  prefix: "/",
  decorateReply: false,
  setHeaders: (res) => {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  },
});

await app.register(fastifyStatic, {
  root: path.join(__dirname, "public"),
  prefix: "/",
  decorateReply: false,
  setHeaders: (res) => {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  },
});

// Health check endpoint
app.get("/healthz", async (_, reply) => {
  return reply.code(200).send({ status: "ok" });
});

// Handle all other routes with React Router’s SSR handler
app.all("/*", async (req, reply) => {
  const handler = createRequestHandler({ build });
  const nodeReq = {
    method: req.method,
    headers: req.headers,
    url: req.url,
  };
  const nodeRes = {
    writeHead: (status, headers) => reply.code(status).headers(headers),
    end: (body) => reply.send(body),
  };
  return handler(nodeReq, nodeRes);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen({ port: PORT, host: "0.0.0.0" })
  .then(() => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
