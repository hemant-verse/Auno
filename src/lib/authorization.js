import { apiError } from '@/lib/api-response';
import { authorizeRequest } from '@/lib/middleware';

export function requireAuth(request) {
  const result = authorizeRequest(request);

  if (result.errorResponse || !result.user?.id) {
    return {
      user: null,
      response: apiError(
        result.errorResponse?.error || 'Unauthorized',
        result.errorResponse?.status || 401
      ),
    };
  }

  return { user: result.user, response: null };
}

export function getUserId(user) {
  return user?.id || user?._id || user?.userId || null;
}

export function isOwner(user, ownerId) {
  const userId = getUserId(user);
  return Boolean(userId && ownerId && String(userId) === String(ownerId));
}

export async function requireAdmin(request, User) {
  const auth = requireAuth(request);

  if (auth.response) {
    return { user: null, fullUser: null, response: auth.response };
  }

  const fullUser = await User.findById(getUserId(auth.user))
    .select('role')
    .lean();

  if (!fullUser || fullUser.role !== 'admin') {
    return {
      user: auth.user,
      fullUser,
      response: apiError('Forbidden', 403),
    };
  }

  return { user: auth.user, fullUser, response: null };
}