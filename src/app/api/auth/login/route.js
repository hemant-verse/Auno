// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDb from '@/lib/db';
import UserModel from '@/models/user.model';
import { loginSchema } from '@/schemas/authschema';
import { generateAccessToken, generateRefreshToken, hashToken } from '@/lib/auth';
import Session from '@/models/Session';

export async function POST(request) {
  try {
    await connectDb();

    const body = await request.json();

    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      const formattedErrors = validation.error.issues.map((issue) => ({
        fieldName: issue.path,
        message: issue.message
      }));
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: formattedErrors
        },
        { status: 400 }
      );
    }

    const { email, Password } = validation.data;


    const user = await UserModel.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'email not found' },
        { status: 401 }
      );
    }


    const isPasswordValid = await bcrypt.compare(Password, user.Password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid password.' },
        { status: 401 }
      );
    }


    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const hashedRefresh = hashToken(refreshToken);

    // Save the hashed token to the Session Manager
    await Session.create({
      userId: user._id,
      refreshHash: hashedRefresh,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    // --- FIX: Instantiate the response object properly ---
    const response = new NextResponse(
      JSON.stringify({
        message: 'Login successful!',
        accessToken,
        user: { id: user._id, name: user.name, email: user.email }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

    // Append the cookie directly to the fresh response object
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/',
    });

    return response;


  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}