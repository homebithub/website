import { createRequestHandler } from "@remix-run/express";
import { broadcastDevReady } from "@remix-run/node";
import express from "express";
import cors from 'cors';
import httpProxy from 'http-proxy';
// notice that the result of `remix build` is "just a module"
import * as build from "./build/index.js";

const proxy = httpProxy.createProxyServer();
const app = express();
app.use(express.static("public"));
app.use(cors());



// app.all('/socket.io/*', (req, res) => {
//     proxy.web(req, res, { target: FULL_HOST} ); // Change the target to your Node.js server address
// });

app.all("*", createRequestHandler({ build }));

app.listen(3000, () => {
    if (process.env.NODE_ENV === "development") {
        broadcastDevReady(build);
    }
    console.log("App listening on http://localhost:3000");
});
