const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const host = process.env.USER_HOST;
const axios = require('axios');

const projectProxyRouter = express.Router();
projectProxyRouter.use(
    "/:user_id/all", (req, res, next) =>{
        const targetUrl = `${host}/v1/api/projects/getAllProjects/${req.params.user_id}`
        createProxyMiddleware({
            target: targetUrl,
        })(req, res, next)
    });

projectProxyRouter.use("/:project_id", async (req, res, next) => {
    const { project_id } = req.params;
    try {
        const response = await axios.get(`${host}/v1/api/projects/${project_id}`,
            {headers: req.headers, withCredentials: true });
        if (response.data.isMatch) {
            const targetUrl = `http://localhost:3003/project/${project_id}`;
            createProxyMiddleware({
                target: targetUrl,
            })(req, res, next);
        } else {
            const targetUrl = `${host}/v1/api/projects/${project_id}`;
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
        const targetUrl = `${host}/v1/api/projects/${req.params.project_id}/update`
        createProxyMiddleware({
        target: targetUrl,
        })(req, res, next)
    });


module.exports = projectProxyRouter;