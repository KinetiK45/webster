const {verifyToken} = require("../controllers/TokenController");

function tokenMiddleware(req, res, next) {
    verifyToken(req, res)
        .then(() => {
            next();
        })
        .catch(error => {
            console.error(error);
            // res.status(401).json({ state: false, message: 'Authentication error' });
        });
}

module.exports = tokenMiddleware;