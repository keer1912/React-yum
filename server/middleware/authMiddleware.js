import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  try {
    // Log the full authorization header
    console.log('Auth Header:', req.header('Authorization'));

    // Check if Authorization header exists
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      console.log('No Authorization header found');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Check if it follows Bearer scheme
    if (!authHeader.startsWith('Bearer ')) {
      console.log('Invalid Authorization header format');
      return res.status(401).json({ message: 'Invalid token format' });
    }

    // Extract token
    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('No token found after Bearer');
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully:', { userId: decoded.userId });

    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(401).json({ message: 'Token verification failed' });
  }
};

export default authMiddleware;