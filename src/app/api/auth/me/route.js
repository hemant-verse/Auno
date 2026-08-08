import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/user.model';
import { authorizeRequest } from '@/lib/middleware';
import { verifyRefreshToken, generateAccessToken } from '@/lib/auth';

export async function GET(request) {
  try {
    let userId = null;
    let newAccessToken = null;

    // 1. Primary Strategy: Check Authorization Bearer Header
    const { user: bearerUser } = authorizeRequest(request);

    if (bearerUser) {
      userId = bearerUser.id || bearerUser._id;
    } else {
      // 2. Fallback Strategy: Check HTTP-only Refresh Token Cookie
      const refreshToken = request.cookies.get('refreshToken')?.value;

      if (!refreshToken) {
        return NextResponse.json(
          { error: 'Unauthorized: No token provided' },
          { status: 401 }
        );
      }

      const decodedRefreshToken = verifyRefreshToken(refreshToken);
      if (!decodedRefreshToken) {
        return NextResponse.json(
          { error: 'Unauthorized: Refresh token expired or invalid' },
          { status: 401 }
        );
      }

      userId = decodedRefreshToken.id || decodedRefreshToken._id;

      // Generate new access token for seamless state recovery
      newAccessToken = generateAccessToken({ id: userId });
    }

    // 3. Database Fetch & Sanitize
    await connectDB();
    const user = await User.findById(userId).select('-password').lean();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // 4. Construct Response Payload
    const responsePayload = { user };
    if (newAccessToken) {
      responsePayload.accessToken = newAccessToken;
    }

    return NextResponse.json(responsePayload, { status: 200 });

  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}