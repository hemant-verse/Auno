import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/user.model';
import Session from '@/models/Session';
import { authorizeRequest } from '@/lib/middleware';
import {
  verifyRefreshToken,
  generateAccessToken,
  hashToken,
} from '@/lib/auth';

export async function GET(request) {
  try {
    let userId = null;
    let newAccessToken = null;

    const { user: bearerUser } = authorizeRequest(request);

    if (bearerUser) {
      userId = bearerUser.id;
    } else {
      const refreshToken = request.cookies.get('refreshToken')?.value;

      if (!refreshToken) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }

      const decodedRefreshToken = verifyRefreshToken(refreshToken);

      if (!decodedRefreshToken?.id) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }

      await connectDB();

      // A refresh JWT alone is not sufficient authentication. It must also
      // correspond to an active server-side session.
      const activeSession = await Session.findOne({
        refreshHash: hashToken(refreshToken),
        userId: decodedRefreshToken.id,
      }).lean();

      if (!activeSession) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }

      userId = decodedRefreshToken.id;
      newAccessToken = generateAccessToken({ id: userId });
    }

    await connectDB();

    // The User schema uses `Password`, not `password`.
    const user = await User.findById(userId)
      .select('-Password')
      .lean();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const responsePayload = {
      success: true,
      user: {
        ...user,
        _id: String(user._id),
      },
    };

    if (newAccessToken) {
      responsePayload.accessToken = newAccessToken;
    }

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}