import { createRequestHandler } from "@remix-run/express";
import { broadcastDevReady } from "@remix-run/node";
import express from "express";
import cors from 'cors';
// notice that the result of `remix build` is "just a module"
import * as build from "./build/index.js";

const app = express();
app.use(cors());

// Serve built assets from /public/build at /build with long-term caching
app.use(
  "/build",
  express.static("public/build")
);

// Serve other static assets from /public with shorter cache
app.use(express.static("public"));

// Lightweight health endpoint (in addition to Remix /health route)
app.get("/healthz", (req, res) => res.status(200).json({ status: "ok" }));


// app.all('/socket.io/*', (req, res) => {
//     proxy.web(req, res, { target: FULL_HOST} ); // Change the target to your Node.js server address
// });

// All other requests handled by Remix
app.all("*", createRequestHandler({ build }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    if (process.env.NODE_ENV === "development") {
        broadcastDevReady(build);
    }
    console.log(`App listening on port ${PORT}`);
});
