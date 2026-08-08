import { NextResponse } from 'next/server';
import connectDB from '@/lib/db.js';
import UserModel from '@/models/user.model.js';
import OTPModel from '@/models/otp.model.js';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    await connectDB();
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Fetch active OTP record
    const otpRecord = await OTPModel.findOne({ email });
    if (!otpRecord) {
      return NextResponse.json(
        { error: 'OTP has expired or was not found. Please request a new code.' },
        { status: 400 }
      );
    }

    // Verify OTP against stored hash
    const isValid = await bcrypt.compare(otp, otpRecord.otpHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code. Please check and try again.' },
        { status: 400 }
      );
    }

    // Update user status to verified
    const user = await UserModel.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );

    // Cleanup used OTP
    await OTPModel.deleteOne({ _id: otpRecord._id });

    return NextResponse.json(
      {
        message: 'Account verified successfully! You can now log in.',
        user: {
          id: user._id,
          name: user.UserName,
          email: user.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify OTP API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error occurred.' },
      { status: 500 }
    );
  }
}