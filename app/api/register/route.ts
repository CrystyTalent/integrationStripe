import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    // Validate required fields
    if (!username || !email || !password) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: ['username', 'email', 'password'],
        },
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

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Validate username length
    if (username.length < 3 || username.length > 30) {
      return NextResponse.json(
        { error: 'Username must be between 3 and 30 characters' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Check if user with email or username already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 409 }
      );
    }

    // Create user (password will be hashed by pre-save hook)
    const user = new User({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password, // Will be hashed automatically
      isActive: true,
    });

    await user.save();

    // Return user data (without password)
    const response = NextResponse.json(
      {
        message: 'User registered successfully',
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
      },
      { status: 201 }
    );
    return NextResponse.json(response, request);
  } catch (error: any) {
    console.error('User registration error:', error);
    if (error.code === 11000) {
      // MongoDB duplicate key error
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 409 }
      );
    } else {
      return NextResponse.json(
        { error: error.message || 'Failed to register user' },
        { status: 500 }
      );
    }
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      message: 'User Registration API',
      method: 'POST',
      requiredFields: ['username', 'email', 'password'],
      example: {
        username: 'johndoe',
        email: 'john@example.com',
        password: 'securepassword123',
      },
    },
    { status: 200 }
  );
}
