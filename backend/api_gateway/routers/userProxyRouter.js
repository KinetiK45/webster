const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const host = process.env.AUTHENTICATION_HOST;

const userProxyRouter = express.Router();

userProxyRouter.use("/:user_id", (req, res, next) => {
    req.userId = req.params.user_id;
    console.log("User ID:", req.userId);

    const targetUrl = `${host}/v1/api/users/${req.userId}`;
    createProxyMiddleware({
        target: targetUrl,
    })(req, res, next);
});

userProxyRouter.use(
    "/login",
    createProxyMiddleware({
        target: `${host}/v1/api/users/update`,
    })
);

userProxyRouter.use(
    "/avatarUpload",
    createProxyMiddleware({
        target: `${host}/v1/api/users/avatar`,
    })
);

userProxyRouter.use(
    "/create",
    createProxyMiddleware({
        target: `${host}/v1/api/users/create`,
    })
)

module.exports = userProxyRouter;