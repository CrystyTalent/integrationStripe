import { NextRequest, NextResponse } from 'next/server';
import { withApiAuth, AuthenticatedRequest } from '@/lib/middleware/api-auth';
import Stripe from 'stripe';
import connectDB from '@/lib/mongodb';
import CheckoutToken from '@/models/CheckoutToken';
import Payment from '@/models/Payment';
import { generateCheckoutToken } from '@/lib/api-key';

async function handler(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    const store = req.store!;
    const body = await req.json();
    const {
      amount,
      currency = 'usd',
      productName = 'Payment',
      customerEmail,
      successUrl,
      cancelUrl,
    } = body;

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount. Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Validate currency
    const validCurrencies = ['usd', 'eur', 'gbp', 'cad', 'aud', 'jpy', 'inr'];
    const currencyLower = currency.toLowerCase();
    if (!validCurrencies.includes(currencyLower)) {
      return NextResponse.json(
        { error: `Invalid currency. Supported currencies: ${validCurrencies.join(', ')}` },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Get store's Stripe secret key
    const stripeSecretKey = store.getDecryptedStripeSecretKey();
    
    // Create Stripe client with store's key
    const stripe = new Stripe(stripeSecretKey);

    // Convert amount to cents (Stripe uses smallest currency unit)
    const amountInCents = Math.round(parseFloat(amount) * 100);

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currencyLower,
      metadata: {
        storeId: store._id,
        storeName: store.storeName,
        productName,
        customerEmail: customerEmail || '',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Generate checkout token (expires in 30 minutes)
    const token = generateCheckoutToken();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    // Save checkout token
    await CheckoutToken.create({
      token,
      storeId: store._id,
      paymentIntentId: paymentIntent.id,
      amount: parseFloat(amount),
      currency: currencyLower,
      productName,
      customerEmail: customerEmail || undefined,
      successUrl: successUrl || undefined,
      cancelUrl: cancelUrl || undefined,
      expiresAt,
      used: false,
    });

    // Save payment record
    await Payment.create({
      storeId: store._id,
      paymentIntentId: paymentIntent.id,
      amount: parseFloat(amount),
      currency: currencyLower,
      status: 'pending',
      customerEmail: customerEmail || undefined,
      metadata: {
        productName,
        storeName: store.storeName,
      },
    });

    // Generate checkout URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const checkoutUrl = `${baseUrl}/checkout?token=${token}`;

    return NextResponse.json(
      {
        checkoutUrl,
        token,
        paymentIntentId: paymentIntent.id,
        amount: parseFloat(amount),
        currency: currencyLower,
        expiresAt: expiresAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating checkout:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout' },
      { status: 500 }
    );
  }
}

export const POST = withApiAuth(handler);
