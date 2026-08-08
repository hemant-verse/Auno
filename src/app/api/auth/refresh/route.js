// app/api/auth/refresh/route.js
import { NextResponse } from 'next/server';
import connectDb from '@/lib/db';
import Session from '@/models/Session';
import User from '@/models/user.model';
import { 
  verifyRefreshToken, 
  hashToken, 
  generateAccessToken, 
  generateRefreshToken 
} from '@/lib/auth';

export async function POST(request) {
  try {
    await connectDb();

    // 1. Grab the refresh token from cookies
    const cookieToken = request.cookies.get('refreshToken')?.value;
    if (!cookieToken) {
      return NextResponse.json({ error: 'Refresh token missing' }, { status: 401 });
    }

    // 2. Verify structural validity and expiration of JWT
    const decoded = verifyRefreshToken(cookieToken);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid or expired refresh token' }, { status: 401 });
    }

    // 3. Hash the cookie token to find it in the Session Manager
    const incomingHash = hashToken(cookieToken);
    const activeSession = await Session.findOne({ refreshHash: incomingHash });

    if (!activeSession) {
      // BREACH DETECTION: If a refresh token is valid but not in the DB, it may have been stolen!
      // Wipe all active sessions for this user for security.
      await Session.deleteMany({ userId: decoded.id });
      return NextResponse.json({ error: 'Security breach detected. Please log in again.' }, { status: 401 });
    }

    // 4. Clean up / delete the used session to perform the rotation
    await activeSession.deleteOne();

    // 5. Fetch user profile to maintain payload integrity
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: 'User no longer exists' }, { status: 401 });
    }

    // 6. Generate the rotated pair
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    const newHashedRefresh = hashToken(newRefreshToken);

    // 7. Store the brand new refresh session in the manager
    await Session.create({
      userId: user._id,
      refreshHash: newHashedRefresh,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const response = NextResponse.json({
      accessToken: newAccessToken,
    }, { status: 200 });

    // 8. Replace the old cookie with the rotated token
    response.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Refresh Rotation Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}