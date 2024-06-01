const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const userHost = process.env.USER_URL;
const projectHost = process.env.PROJECT_URL;
const axios = require('axios');

const projectProxyRouter = express.Router();
projectProxyRouter.use(
    "/:user_id/all", (req, res, next) =>{
        const targetUrl = `${userHost}/v1/api/projects/getAllProjects/${req.params.user_id}`
        createProxyMiddleware({
            target: targetUrl,
        })(req, res, next)
    });

projectProxyRouter.use("/:project_id", async (req, res, next) => {
    const { project_id } = req.params;
    try {
        const response = await axios.get(`${userHost}/v1/api/projects/${project_id}`,
            {headers: req.headers, withCredentials: true });
        if (response.data.isMatch) {
            const targetUrl = `${projectHost}/v1/api/project/${project_id}`;
            createProxyMiddleware({
                target: targetUrl,
            })(req, res, next);
        } else {
            const targetUrl = `${userHost}/v1/api/projects/${project_id}`;
            createProxyMiddleware({
                target: targetUrl,
            })(req, res, next);
        }
    } catch (error) {
        console.error('Error in proxy middleware:', error);
        res.status(500).json({ state: false, message: "Internal server error" });
    }
});

projectProxyRouter.use(
    "/:project_id/update",(req, res, next) => {
        const targetUrl = `${userHost}/v1/api/projects/${req.params.project_id}/update`
        createProxyMiddleware({
        target: targetUrl,
        })(req, res, next)
    });

projectProxyRouter.use(
    "/:project_id/save",(req, res, next) => {
        const targetUrl = `${projectHost}/v1/api/project/${req.params.project_id}/save`
        createProxyMiddleware({
            target: targetUrl,
        })(req, res, next)
    });

projectProxyRouter.use(
    "/create",
    createProxyMiddleware({
        target: `${userHost}/v1/api/projects/create`,
    })
)

module.exports = projectProxyRouter;