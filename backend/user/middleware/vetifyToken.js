const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;

function tokenMiddleware(req, res, next) {
    const token = req.cookies?.auth_token;

    if (!token) {
        console.error('No authorization token');
        // return res.status(401).json({ state: false, message: 'No authorization token' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            console.error('Invalid token');
            // return res.status(401).json({ state: false, message: 'Invalid token' });
        }

        req.senderData = decoded;
        next();
    });
}


module.exports = tokenMiddleware;