import { NextResponse } from 'next/server';
import connectDB from '@/lib/db.js';
import UserModel from '@/models/user.model.js';
import OTPModel from '@/models/otp.model.js';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    await connectDB();
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: 'Email, OTP code, and new password are required.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // Verify OTP existence
    const otpRecord = await OTPModel.findOne({ email });
    if (!otpRecord) {
      return NextResponse.json(
        { error: 'Reset code expired or invalid. Please request a new code.' },
        { status: 400 }
      );
    }

    // Verify OTP hash
    const isValidOtp = await bcrypt.compare(otp, otpRecord.otpHash);
    if (!isValidOtp) {
      return NextResponse.json(
        { error: 'Invalid verification code. Check your inbox and try again.' },
        { status: 400 }
      );
    }

    // Hash new password & update user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await UserModel.findOneAndUpdate(
      { email },
      { Password: hashedPassword }
    );

    // Delete used OTP
    await OTPModel.deleteOne({ _id: otpRecord._id });

    return NextResponse.json(
      { message: 'Password reset successful! You can now log in.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset Password API Error:', error);
    return NextResponse.json({ error: 'Internal server error occurred.' }, { status: 500 });
  }
}