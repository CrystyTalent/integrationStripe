import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { paymentStoreFunctions } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency = 'usd', productName = 'Payment', customerEmail } = body;

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Convert amount to cents (Stripe uses smallest currency unit)
    const amountInCents = Math.round(parseFloat(amount) * 100);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      metadata: {
        productName,
        customerEmail: customerEmail || '',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Store payment record with pending status
    const paymentRecord = paymentStoreFunctions.create({
      id: paymentIntent.id,
      amount: parseFloat(amount),
      currency: currency.toLowerCase(),
      status: 'pending',
      customerEmail: customerEmail || undefined,
      paymentIntentId: paymentIntent.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      paymentId: paymentRecord.id,
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
