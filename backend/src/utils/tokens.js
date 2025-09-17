// src/utils/tokens.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';
const REFRESH_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';

// Sign access token (JWT)
function signAccessToken(userId, role = null) {
  const payload = { id: userId };
  if (role) payload.role = role;
  
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET, {
    expiresIn: ACCESS_EXPIRES,
  });
}


// Create refresh token (JWT) and return both token and its hash
function signRefreshToken(userId, role = null) {
  const jti = crypto.randomBytes(16).toString('hex');
  const payload = { id: userId, jti };
  if (role) payload.role = role;
  
  const token = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: REFRESH_EXPIRES,
  });

  const hash = hashToken(token);
  return { token, hash };
}


function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  hashToken,
  verifyAccessToken,
  verifyRefreshToken,
};
