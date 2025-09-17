// utils/response.js

/**
 * Send successful response
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {Object} data - Response data (optional)
 * @param {number} status - HTTP status code (default: 200)
 * @returns {Object} JSON response
 */
exports.success = (res, message, data = {}, status = 200) => {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString()
  };

  // Only add data if it's not empty
  if (data && Object.keys(data).length > 0) {
    response.data = data;
  }

  return res.status(status).json(response);
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} status - HTTP status code (default: 500)
 * @param {Object} error - Error object for development (optional)
 * @returns {Object} JSON response
 */
exports.error = (res, message, status = 500, error = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };

  // Log error for debugging
  console.error(`❌ API ERROR [${status}]:`, message);
  if (error) {
    console.error('Error details:', error.message || error);
  }

  // Only include error details in development
  if (error && process.env.NODE_ENV === 'development') {
    response.error = {
      message: error.message || error,
      stack: error.stack || undefined
    };
  }

  return res.status(status).json(response);
};

/**
 * Send validation error response
 * @param {Object} res - Express response object
 * @param {Array|Object} validationErrors - Validation error details
 * @returns {Object} JSON response
 */
exports.validationError = (res, validationErrors) => {
  const response = {
    success: false,
    message: 'Validation failed',
    errors: validationErrors,
    timestamp: new Date().toISOString()
  };

  return res.status(400).json(response);
};

/**
 * Send unauthorized response
 * @param {Object} res - Express response object
 * @param {string} message - Custom message (optional)
 * @returns {Object} JSON response
 */
exports.unauthorized = (res, message = 'Unauthorized access') => {
  return res.status(401).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};

/**
 * Send forbidden response
 * @param {Object} res - Express response object
 * @param {string} message - Custom message (optional)
 * @returns {Object} JSON response
 */
exports.forbidden = (res, message = 'Access forbidden') => {
  return res.status(403).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};

/**
 * Send not found response
 * @param {Object} res - Express response object
 * @param {string} message - Custom message (optional)
 * @returns {Object} JSON response
 */
exports.notFound = (res, message = 'Resource not found') => {
  return res.status(404).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};