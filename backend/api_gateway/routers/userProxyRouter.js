const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const host = process.env.USER_URL;

const userProxyRouter = express.Router();

userProxyRouter.use("/:user_id", (req, res, next) => {
    const targetUrl = `${host}/v1/api/users/${req.params.user_id}`;
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