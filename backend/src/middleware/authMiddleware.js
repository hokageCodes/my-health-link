const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper for consistent error responses
const sendAuthError = (res, message, statusCode = 401, expired = false) => {
  return res.status(statusCode).json({
    success: false,
    message,
    expired,
    timestamp: new Date().toISOString()
  });
};

// Main authentication middleware
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Extract token from Authorization header or cookies
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return sendAuthError(res, 'Not authorized, no token provided');
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      const isExpired = err.name === 'TokenExpiredError';
      return sendAuthError(res, 'Invalid or expired token', 401, isExpired);
    }

    // Find user and exclude sensitive fields
    const user = await User.findById(decoded.id)
      .select('-passwordHash -refreshTokenHash -otp -resetToken');
    
    if (!user) {
      return sendAuthError(res, 'User not found - token may be invalid');
    }

    // Check verification status
    if (!user.isVerified) {
      return sendAuthError(res, 'Please verify your email address to access this resource', 403);
    }

    // Add user to request
    req.user = user;
    next();

  } catch (error) {
    console.error('Auth middleware error:', error);
    return sendAuthError(res, 'Authentication error', 500);
  }
};

// Role-based authorization
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendAuthError(res, 'Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      return sendAuthError(res, `Access denied. Required roles: ${roles.join(', ')}`, 403);
    }

    next();
  };
};

// Optional authentication - doesn't fail if no token
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
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
      // Silently fail for optional auth
    }

    next();
  } catch (error) {
    next(); // Continue even on error for optional auth
  }
};