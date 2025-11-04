import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.error('JWT verification failed:', err.message);
        return res.status(403).json({ error: 'Invalid token' });
      }
      if (!user || !user.id) {
        return res.status(403).json({ error: 'Invalid token payload' });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('JWT verification error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    try {
      if (!Array.isArray(roles) || roles.length === 0) {
        console.error('Invalid roles configuration');
        return res.status(500).json({ error: 'Server configuration error' });
      }
      if (!req.user || !req.user.role) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      next();
    } catch (error) {
      console.error('Role verification error:', error);
      return res.status(500).json({ error: 'Authorization failed' });
    }
  };
};