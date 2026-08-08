// lib/auth.js
import jwt from 'jsonwebtoken';
import crypto from 'crypto';


const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// Fast SHA-256 hashing helper for the session manager
export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id || user._id, email: user.email },
    ACCESS_SECRET,
    { expiresIn: '30m' }
  );
}

export function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id || user._id },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, ACCESS_SECRET);
  } catch (error) {
    return null;
  }
}

export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, REFRESH_SECRET);
  } catch (error) {
    return null;
  }
}