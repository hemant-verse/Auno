import { NextResponse } from 'next/server';
import connectDb from '@/lib/db';
import Session from '@/models/Session';
import User from '@/models/user.model';
import {
  verifyRefreshToken,
  hashToken,
  generateAccessToken,
  generateRefreshToken,
} from '@/lib/auth';

const REFRESH_MAX_AGE = 7 * 24 * 60 * 60;

export async function POST(request) {
  try {
    await connectDb();

    const cookieToken = request.cookies.get('refreshToken')?.value;

    if (!cookieToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyRefreshToken(cookieToken);

    if (!decoded?.id) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    // Atomic consumption prevents two requests from successfully rotating
    // the same refresh token.
    const activeSession = await Session.findOneAndDelete({
      refreshHash: hashToken(cookieToken),
      userId: decoded.id,
    });

    if (!activeSession) {
      // Do not delete every session here. A concurrent request can legitimately
      // observe the token after another request has atomically consumed it.
      return NextResponse.json(
        { success: false, error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    await Session.create({
      userId: user._id,
      refreshHash: hashToken(newRefreshToken),
      expiresAt: new Date(Date.now() + REFRESH_MAX_AGE * 1000),
    });

    const response = NextResponse.json(
      {
        success: true,
        accessToken: newAccessToken,
      },
      { status: 200 }
    );

    response.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: REFRESH_MAX_AGE,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Refresh Rotation Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}