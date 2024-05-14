const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const loginLimiter = require("../../authentication/middleware/loginLimiter");
const host = process.env.AUTHENTICATION_HOST;
const authProxyRouter = express.Router();

authProxyRouter.use(
    "/register",
    createProxyMiddleware({
        target: `${host}/v1/api/auth/register`,
    })
);

authProxyRouter.use(
    "/login",
    createProxyMiddleware({
        target: `${host}/v1/api/auth/login`,
    })
);

authProxyRouter.use(
    "/login-confirm",
    createProxyMiddleware({
        target: `${host}/v1/api/auth/login-confirm`,
    })
);

authProxyRouter.use(
    "/logout",
    createProxyMiddleware({
        target: `${host}/v1/api/auth/logout`,
    })
);

authProxyRouter.use(
    "/password-reset",
    createProxyMiddleware({
        target: `${host}/v1/api/auth/password-reset`,
    })
);

authProxyRouter.use(
    "/password-reset/:resetPasswordCode",
    (req, res, next) => {
        const targetUrl = `${host}/v1/api/auth/password-reset/${req.params.resetPasswordCode}`;
        createProxyMiddleware({
            target: targetUrl,
        })(req, res, next);
    }
);


module.exports = authProxyRouter;
