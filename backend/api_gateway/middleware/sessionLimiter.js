const rateLimit = 20;
const interval = 60 * 1000;

const requestCounts = {};
setInterval(() => {
    Object.keys(requestCounts).forEach((ip) => {
        requestCounts[ip] = 0;
    });
}, interval);

function rateLimitAndTimeout(req, res, next) {
    const ip = req.ip;

    requestCounts[ip] = (requestCounts[ip] || 0) + 1;

    if (requestCounts[ip] > rateLimit) {
        return res.status(429).json({
            code: 429,
            status: "Error",
            message: "Rate limit exceeded.",
        });
    }

    req.setTimeout(15000, () => {
        res.status(504).json({
            code: 504,
            status: "Error",
            message: "Gateway timeout.",
        });
        req.abort();
    });
    next();
}


module.exports = rateLimitAndTimeout;