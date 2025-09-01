const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    // Expect header: Authorization: Bearer <token>
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided (service/jwt.js)' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token (service/jwt.js)' });
        }
        req.user = user; // Attach decoded user info to request
        next();
    });
}

module.exports = { authenticateToken };