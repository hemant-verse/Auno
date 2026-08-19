import { verifyAccessToken } from './auth';

export function authorizeRequest(request) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !/^Bearer\s+/i.test(authHeader)) {
    return {
      user: null,
      errorResponse: {
        error: 'Unauthorized',
        status: 401,
      },
    };
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    return {
      user: null,
      errorResponse: {
        error: 'Unauthorized',
        status: 401,
      },
    };
  }

  const decoded = verifyAccessToken(token);

  if (!decoded || !decoded.id) {
    return {
      user: null,
      errorResponse: {
        error: 'Unauthorized',
        status: 401,
      },
    };
  }

  return {
    user: decoded,
    errorResponse: null,
  };
}