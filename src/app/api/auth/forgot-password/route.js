import { NextResponse } from 'next/server';
import connectDB from '@/lib/db.js';
import UserModel from '@/models/user.model.js';
import OTPModel from '@/models/otp.model.js';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@/lib/mailer.js';
import { getResetPasswordEmailTemplate } from '@/lib/emailTemplates.js';

export async function POST(req) {
  try {
    await connectDB();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Campus email is required.' }, { status: 400 });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'No account found with this email address.' }, { status: 404 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpSalt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, otpSalt);

    // Store in OTP collection (10-min TTL)
    await OTPModel.deleteMany({ email });
    await OTPModel.create({
      email,
      otpHash: hashedOtp,
    });

    // Send email via Nodemailer
    await sendEmail({
      to: email,
      subject: `${otp} is your password reset code`,
      html: getResetPasswordEmailTemplate(otp, user.UserName),
    });

    return NextResponse.json(
      { message: 'Password reset code sent to your email.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot Password API Error:', error);
    return NextResponse.json({ error: 'Internal server error occurred.' }, { status: 500 });
  }
}