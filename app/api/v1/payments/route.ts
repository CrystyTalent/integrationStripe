import { NextRequest, NextResponse } from 'next/server';
import { withApiAuth, AuthenticatedRequest } from '@/lib/middleware/api-auth';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';

// Force dynamic rendering for this route (uses request.headers for API key auth)
export const dynamic = 'force-dynamic';

async function handler(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    const store = req.store!;
    const status = req.nextUrl.searchParams.get('status');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50');
    const offset = parseInt(req.nextUrl.searchParams.get('offset') || '0');

    // Connect to database
    await connectDB();

    // Build query
    const query: any = { userId: store._id };
    
    if (status && ['pending', 'completed', 'failed', 'canceled'].includes(status)) {
      query.status = status;
    }

    // Fetch payments
    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .select('-__v')
      .lean();

    // Get total count for pagination
    const total = await Payment.countDocuments(query);

    return NextResponse.json({
      payments,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

export const GET = withApiAuth(handler);
