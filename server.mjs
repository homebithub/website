import { createRequestHandler } from "@react-router/express";
import express from "express";
import cors from 'cors';
// notice that the result of `react-router build` is "just a module"
import * as build from "./build/server/index.js";

const app = express();
console.log("We reached herer")
app.use(cors());
// Serve built assets from /public/build at /build with long-term caching
// app.use(
//   "/build",
//   express.static("public/build")
// );

// Serve other static assets from /public with shorter cache
app.use(express.static("public"));
console.log("We reached here2")

// Lightweight health endpoint (in addition to Remix /health route)
app.get("/healthz", (req, res) => res.status(200).json({ status: "ok" }));

console.log("We reached here3")

// app.all('/socket.io/*', (req, res) => {
//     proxy.web(req, res, { target: FULL_HOST} ); // Change the target to your Node.js server address
// });

// All other requests handled by React Router
app.all("*", createRequestHandler({ build }));
console.log("We reached here 4")

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("We reached herer0")
    console.log(`App listening on port ${PORT}`);
});
