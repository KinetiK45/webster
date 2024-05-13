const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 3,

    handler: function (req, res, next) {
        res.status(429).json({ state: false, message: "Too many login attempts. Please wait." });
    },

    standardHeaders: true,
    legacyHeaders: false
});

module.exports = loginLimiter