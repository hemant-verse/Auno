// lib/middleware.js
import { verifyAccessToken } from './auth';

export function authorizeRequest(request) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, errorResponse: { error: 'unauthorized', status: 401 } };
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return { user: null, errorResponse: { error: 'Access token expired or malformed', status: 401 } };
  }

  return { user: decoded, errorResponse: null };
}