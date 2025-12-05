import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export interface AuthenticatedRequest extends NextRequest {
  store?: {
    _id: string;
    username: string;
    email: string;
    stripePublishableKey?: string;
    getDecryptedStripeSecretKey: () => string;
    getDecryptedWebhookSecret: () => string | undefined;
  };
}

export interface AuthenticatedUserRequest extends NextRequest {
  user?: {
    _id: string;
    username: string;
    email: string;
  };
}

/**
 * Middleware to authenticate STORE requests using API key
 * Looks for API key in Authorization header: Bearer <api_key>
 */
export async function authenticateApiKey(
  request: NextRequest
): Promise<{ store: any; error: null } | { store: null; error: NextResponse }> {
  try {
    // Extract API key from Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        store: null,
        error: NextResponse.json(
          { error: 'Missing or invalid Authorization header. Use: Bearer <api_key>' },
          { status: 401 }
        ),
      };
    }

    const apiKey = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!apiKey) {
      return {
        store: null,
        error: NextResponse.json(
          { error: 'API key is required' },
          { status: 401 }
        ),
      };
    }

    // Connect to database
    await connectDB();

    // Find user by API key hash
    const users = await User.find({ isActive: true, apiKeyHash: { $exists: true, $ne: null } });
    
    // Compare API key with all users (since we can't directly query by hash)
    let user = null;
    for (const u of users) {
      const isMatch = await u.compareApiKey(apiKey);
      if (isMatch) {
        user = u;
        break;
      }
    }

    if (!user) {
      return {
        store: null,
        error: NextResponse.json(
          { error: 'Invalid API key' },
          { status: 401 }
        ),
      };
    }

    if (!user.isActive) {
      return {
        store: null,
        error: NextResponse.json(
          { error: 'User account is inactive' },
          { status: 403 }
        ),
      };
    }

    return {
      store: {
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        stripePublishableKey: user.stripePublishableKey,
        getDecryptedStripeSecretKey: () => user.getDecryptedStripeSecretKey(),
        getDecryptedWebhookSecret: () => user.getDecryptedWebhookSecret(),
      },
      error: null,
    };
  } catch (error: any) {
    console.error('API key authentication error:', error);
    return {
      store: null,
      error: NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Middleware to authenticate USER requests using Basic auth
 * Looks for Authorization header: Basic base64(email:password)
 */
export async function authenticateUser(
  request: NextRequest
): Promise<{ user: any; error: null } | { user: null; error: NextResponse }> {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return {
        user: null,
        error: NextResponse.json(
          {
            error:
              'Missing or invalid Authorization header. Use: Basic base64(email:password)',
          },
          { status: 401 }
        ),
      };
    }

    // Decode Basic auth credentials: email:password
    const base64Credentials = authHeader.substring(6); // Remove 'Basic ' prefix
    const decoded = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [email, password] = decoded.split(':');

    if (!email || !password) {
      return {
        user: null,
        error: NextResponse.json(
          { error: 'Invalid Basic auth payload. Expected email and password.' },
          { status: 401 }
        ),
      };
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return {
        user: null,
        error: NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        ),
      };
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return {
        user: null,
        error: NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        ),
      };
    }

    if (!user.isActive) {
      return {
        user: null,
        error: NextResponse.json(
          { error: 'User account is inactive' },
          { status: 403 }
        ),
      };
    }

    return {
      user: {
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
      },
      error: null,
    };
  } catch (error: any) {
    console.error('User authentication error:', error);
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Wrapper function for STORE API routes that require authentication
 */
export function withApiAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const authResult = await authenticateApiKey(req);
    
    if (authResult.error) {
      return authResult.error;
    }

    // Attach store to request object
    const authenticatedReq = req as AuthenticatedRequest;
    authenticatedReq.store = authResult.store;

    return handler(authenticatedReq);
  };
}

/**
 * Wrapper function for USER API routes that require authentication
 */
export function withUserAuth(
  handler: (req: AuthenticatedUserRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const authResult = await authenticateUser(req);

    if (authResult.error) {
      return authResult.error;
    }

    const authenticatedReq = req as AuthenticatedUserRequest;
    authenticatedReq.user = authResult.user;

    return handler(authenticatedReq);
  };
}
