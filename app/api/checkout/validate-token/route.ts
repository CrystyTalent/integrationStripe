import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CheckoutToken from '@/models/CheckoutToken';
import Stripe from 'stripe';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find token
    const checkoutToken = await CheckoutToken.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() }, // Not expired
    }).populate('storeId');

    if (!checkoutToken) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 404 }
      );
    }

    // Get Stripe client secret from the store's Stripe account

    // Retrieve payment intent to get client secret
    let clientSecret = '';
    

    return NextResponse.json({
      valid: true,
      token: checkoutToken.token,
      checkout: {
        amount: checkoutToken.amount,
        currency: checkoutToken.currency,
        productName: checkoutToken.productName,
        customerEmail: checkoutToken.customerEmail,
        paymentIntentId: checkoutToken.paymentIntentId,
        clientSecret,
        successUrl: checkoutToken.successUrl,
        cancelUrl: checkoutToken.cancelUrl,
      },
    });
  } catch (error: any) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to validate token' },
      { status: 500 }
    );
  }
}
