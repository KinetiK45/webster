const { validationResult } = require('express-validator');

function validateRequest(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        return res.status(400).json({ state: false, message: errorMessages });
    }
    next();
}

module.exports = validateRequest;