'use strict';

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'safetynet-ai-jwt-secret-2025';

/**
 * Verify Bearer JWT. Attaches decoded payload as req.user.
 */
const verifyToken = (req, res, next) => {
  const header = req.headers['authorization'];
  const token  = header && header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(403).json({ success: false, error: 'Invalid or expired token' });
  }
};

/**
 * Must follow verifyToken — rejects non-admin users.
 */
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  next();
};

module.exports = { verifyToken, requireAdmin };
