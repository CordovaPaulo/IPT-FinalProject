const jwt = require('jsonwebtoken');

function authenticateToken(requiredRole) {
    return (req, res, next) => {
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
            // Check for required role if specified
            if (requiredRole && user.role !== requiredRole) {
                return res.status(403).json({ 
                    error: `Insufficient role (service/jwt.js). Required: ${requiredRole}, Received: ${user.role}` 
                });
            }
            req.user = user; // Attach decoded user info to request
            next();
        });
    };
}

const getValuesFromToken = (req) => {
  try {
    // Read token from cookie instead of Authorization header
    const token = req.cookies.MindMateToken;
    
    if (!token) {
      console.log('No token found in cookies');
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

module.exports = { authenticateToken, getValuesFromToken };