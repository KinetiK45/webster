const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const authProxyRouter = require("./authProxyRouter");
const userProxyRouter = require("./userProxyRouter");
const projectProxyRouter = require('./projectProxyRouter');
const proxyRouter = express.Router();

proxyRouter.use("/api/auth", authProxyRouter);
proxyRouter.use("/api/users", userProxyRouter);
proxyRouter.use("/api/projects",projectProxyRouter);
module.exports = proxyRouter;