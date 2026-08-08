import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/mailer';

export async function POST(req) {
  try {
    const { email } = await req.json();

    const result = await sendEmail({
      to: email,
      subject: 'Test Email - CampusMarket',
      html: `
        <div style="font-family: sans-serif; padding: 20px; max-width: 500px; border: 1px solid #eaeaea; rounded: 10px;">
          <h2 style="color: #111;">CampusMarket Email Test</h2>
          <p style="color: #555;">Nodemailer is configured and working properly!</p>
        </div>
      `,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ message: 'Test email sent successfully!' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to trigger email' }, { status: 500 });
  }
}