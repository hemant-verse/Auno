import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getEnv } from './env';

function getAccessSecret() {
  return getEnv().JWT_ACCESS_SECRET;
}

function getRefreshSecret() {
  return getEnv().JWT_REFRESH_SECRET;
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateAccessToken(user) {
  return jwt.sign(
    {
      id: String(user.id || user._id),
      email: user.email,
    },
    getAccessSecret(),
    { expiresIn: '30m' }
  );
}

export function generateRefreshToken(user) {
  return jwt.sign(
    {
      id: String(user.id || user._id),
    },
    getRefreshSecret(),
    { expiresIn: '7d' }
  );
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, getAccessSecret());
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, getRefreshSecret());
  } catch {
    return null;
  }
}