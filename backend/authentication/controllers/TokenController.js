const jwt = require("jsonwebtoken");
const secretYaEby = 'secret key';
const blackList = new Set();

function generateToken(payload, expires = '24h') {
    const options = {
        expiresIn: expires,
    };
    return jwt.sign(payload, secretYaEby, options);
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

function verifyToken(req, res) {
    return new Promise((resolve, reject) => {
        let token;
        try {
            if (req.cookies.auth_token) {
                token = req.cookies.auth_token.replace('Bearer ', '');
            }
        } catch (e) {
            reject(e);
        }

        if (!req.cookies.auth_token) {
            console.log("No authorisation token");
        }
        if (blackList.has(token)) {
            return res.status(401).json({state: false, message: 'The token has already been deleted'});
        }
        jwt.verify(token, secretYaEby, (err, decoded) => {
            if (err) {
                console.log("Invalid token");
                return res.status(401).json({state: false, message: 'Invalid token'});
            }
            req.senderData = decoded;
            resolve();
        });
    });
}

module.exports = {
    generateToken,
    verifyToken,
    deactivateToken
}

