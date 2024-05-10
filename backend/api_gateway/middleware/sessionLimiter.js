const rateLimit = require("express-rate-limit");

const sessionLimiter = rateLimit({
    windowMs: 60 * 1000, // 2 минуты
    max: 20,
    keyGenerator: function (req /*, res*/) {
        return req.cookies.session_token;
    },
    handler: function (req, res /*, next*/) {
        res.status(429).json({state: false, message: "Too many requests. Please try again later."});
    }
});

module.exports = sessionLimiter;