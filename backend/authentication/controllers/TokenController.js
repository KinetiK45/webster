const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET_KEY;
const blackList = new Set();

function generateToken(payload, expires = '24h') {
    const options = {
        expiresIn: expires,
    };
    return jwt.sign(payload, secretKey, options);
}

function deactivateToken(req, res) {
    let token;
    try {
        if (req.cookies.auth_token) {
            token = req.cookies.auth_token;
            res.clearCookie('auth_token');
        }
    } catch (error) {}
    if (!token) {
        return res.json({ state: false, message: 'Missing token' });
    }
    if (blackList.has(token)){
        return res.json({ state: false, message: 'The token has already been deleted' });
    }
    blackList.add(token);
    return res.json({ state: false, message: 'The token has been successfully deleted' });
}

module.exports = {
    generateToken,
    deactivateToken
}

