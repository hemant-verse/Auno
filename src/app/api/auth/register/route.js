import UserModel from "@/models/user.model.js";
import OTPModel from "@/models/otp.model.js";
import connectDB from "@/lib/db.js";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { registerSchema } from "@/schemas/authschema.js";
import { sendEmail } from "@/lib/mailer.js";
import { getOtpEmailTemplate } from "@/lib/emailTemplates.js";

export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();
    const validate = registerSchema.safeParse(data);

    if (!validate.success) {
      const formattedErrors = validate.error.issues.map((issue) => ({
        fieldName: issue.path,
        message: issue.message
      }));
      return NextResponse.json(
        { error: 'Validation failed', details: formattedErrors },
        { status: 400 }
      );
    }

    const { UserName, email, Password } = validate.data;

    // Check if user exists and is already verified
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      if (existingUser.isVerified) {
        return NextResponse.json(
          { message: "Account with this email already exists." },
          { status: 400 }
        );
      }
      // If user exists but is NOT verified, remove old unverified user record
      await UserModel.deleteOne({ _id: existingUser._id });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(Password, salt);

    // Create User (default isVerified: false)
    const newUser = await UserModel.create({
      UserName,
      email,
      Password: hashedPassword,
      isVerified: false,
    });

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP before storing in DB
    const otpSalt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, otpSalt);

    // Remove any previous pending OTP for this email
    await OTPModel.deleteMany({ email });

    // Store hashed OTP in database (Auto-expires in 10 mins)
    await OTPModel.create({
      email,
      otpHash: hashedOtp,
    });

    // Send styled email via Nodemailer
    await sendEmail({
      to: email,
      subject: `${otp} is your CampusMarket verification code`,
      html: getOtpEmailTemplate(otp, UserName),
    });

    return NextResponse.json(
      {
        message: 'Registration successful! Verification OTP sent to your email.',
        email: newUser.email,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration API Error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}