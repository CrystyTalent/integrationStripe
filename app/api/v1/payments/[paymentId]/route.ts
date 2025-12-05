import { NextRequest, NextResponse } from 'next/server';
import { withApiAuth, AuthenticatedRequest } from '@/lib/middleware/api-auth';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';

// Force dynamic rendering for this route (uses request.headers for API key auth)
export const dynamic = 'force-dynamic';

async function handler(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    const store = req.store!;
    // Extract paymentId from the URL path since this handler is wrapped by withApiAuth
    const segments = req.nextUrl.pathname.split('/');
    const paymentId = segments[segments.length - 1];

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find payment by ID and store ID (ensure store can only access their own payments)
    const payment = await Payment.findOne({
      _id: paymentId,
      storeId: store._id,
    }).lean();

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ payment });
  } catch (error: any) {
    console.error('Error fetching payment:', error);
    
    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid payment ID format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to fetch payment' },
      { status: 500 }
    );
  }
}

export const GET = withApiAuth(handler);
