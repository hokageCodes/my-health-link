const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;

    // Get token from Authorization header or cookies
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized, no token provided',
        timestamp: new Date().toISOString()
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      console.error('Token verification error:', err.message);
      
      // Provide specific error information
      const errorResponse = {
        success: false,
        message: 'Invalid or expired token',
        expired: err.name === 'TokenExpiredError',
        timestamp: new Date().toISOString()
      };
      
      return res.status(401).json(errorResponse);
    }

    // Find the user and exclude sensitive fields
    const user = await User.findById(decoded.id)
      .select('-passwordHash -refreshTokenHash -otp -resetToken');
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found - token may be invalid',
        timestamp: new Date().toISOString()
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({ 
        success: false,
        message: 'Please verify your email address to access this resource',
        timestamp: new Date().toISOString()
      });
    }

    // Add user to request object
    req.user = user;
    next();

  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ 
      success: false,
      message: 'Authentication error',
      timestamp: new Date().toISOString()
    });
  }
};

// Role-based authorization middleware
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required',
        timestamp: new Date().toISOString()
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
};

// Optional auth - doesn't fail if no token, but adds user if valid token exists
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      // No token is fine for optional auth
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.id)
        .select('-passwordHash -refreshTokenHash -otp -resetToken');
      
      if (user && user.isVerified) {
        req.user = user;
      }
    } catch (err) {
      // Invalid token is fine for optional auth - just don't set req.user
      console.log('Optional auth - invalid token:', err.message);
    }

    next();
  } catch (err) {
    console.error('Optional auth middleware error:', err);
    next(); // Continue even on error for optional auth
  }
};