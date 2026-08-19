import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDb from '@/lib/db';
import UserModel from '@/models/user.model';
import { loginSchema } from '@/schemas/authschema';
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from '@/lib/auth';
import Session from '@/models/Session';

const REFRESH_MAX_AGE = 7 * 24 * 60 * 60;

export async function POST(request) {
  try {
    await connectDb();

    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      const details = validation.error.issues.map((issue) => ({
        fieldName: issue.path,
        message: issue.message,
      }));

      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details,
        },
        { status: 400 }
      );
    }

    const { email, Password } = validation.data;


    const user = await UserModel.findOne({ email }).select('+Password');;
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    if (!user.isVerified) {
      return NextResponse.json(
        {
          success: false,
          error: 'Account not verified. Register and verify your email.',
        },
        { status: 403 }
      );
    }

    const isPasswordValid = await bcrypt.compare(Password, user.Password);


    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await Session.create({
      userId: user._id,
      refreshHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_MAX_AGE * 1000),
    });

    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful!',
        accessToken,
        user: { id: user._id, name: user.UserName, email: user.email }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: REFRESH_MAX_AGE,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json(
      { success: false, error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}