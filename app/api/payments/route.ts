import { NextRequest, NextResponse } from 'next/server';
import { paymentStoreFunctions } from '@/lib/stripe';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get('status');

    let payments;
    
    if (status && (status === 'pending' || status === 'completed' || status === 'failed')) {
      payments = paymentStoreFunctions.getByStatus(status);
    } else {
      payments = paymentStoreFunctions.getAll();
    }

    return NextResponse.json({ payments });
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}
