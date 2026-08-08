import { NextResponse } from 'next/server';
import connectDB from '@/lib/db.js';
import UserModel from '@/models/user.model.js';
import OTPModel from '@/models/otp.model.js';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@/lib/mailer.js';
import { getOtpEmailTemplate } from '@/lib/emailTemplates.js';

export async function POST(req) {
  try {
    await connectDB();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'User account not found' }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ message: 'Account is already verified.' }, { status: 400 });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpSalt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, otpSalt);

    // Delete existing OTP and create new one
    await OTPModel.deleteMany({ email });
    await OTPModel.create({ email, otpHash: hashedOtp });

    // Send email
    await sendEmail({
      to: email,
      subject: `${otp} is your new verification code`,
      html: getOtpEmailTemplate(otp, user.UserName),
    });

    return NextResponse.json({ message: 'A new verification code has been sent!' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}