import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import PasswordResetToken from '@/models/PasswordResetToken';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (user && user.isActive) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Set expiration (1 hour from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      // Invalidate any existing reset tokens for this user
      await PasswordResetToken.updateMany(
        { userId: user._id, used: false },
        { used: true }
      );

      // Create new reset token
      await PasswordResetToken.create({
        token: resetToken,
        userId: user._id,
        expiresAt,
        used: false,
      });

      // Generate reset URL
      const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;

      // In a real application, you would send an email here
      // For now, we'll log it (in production, use a service like SendGrid, Resend, etc.)
      console.log('Password Reset Email:', {
        to: user.email,
        resetUrl: resetUrl,
      });

      // TODO: Send email with reset link
      // Example with a service like Resend:
      // await resend.emails.send({
      //   from: 'noreply@yourdomain.com',
      //   to: user.email,
      //   subject: 'Reset Your Password',
      //   html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>`,
      // });
    }

    // Always return success message (security best practice)
    return NextResponse.json(
      {
        message: 'If an account with that email exists, we have sent a password reset link.',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Forgot password error:', error);
    // Still return success to prevent email enumeration
    return NextResponse.json(
      {
        message: 'If an account with that email exists, we have sent a password reset link.',
      },
      { status: 200 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      message: 'Forgot Password API',
      method: 'POST',
      requiredFields: ['email'],
      example: {
        email: 'user@example.com',
      },
      note: 'This endpoint always returns success to prevent email enumeration.',
    },
    { status: 200 }
  );
}
