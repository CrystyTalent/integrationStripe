import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { paymentStoreFunctions } from '@/lib/stripe';
import { getBaseUrl } from '@/lib/config';

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

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: productName,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${getBaseUrl()}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getBaseUrl()}/checkout?canceled=true`,
      customer_email: customerEmail || undefined,
    });

    // Store payment record with pending status
    const paymentRecord = paymentStoreFunctions.create({
      id: session.id,
      amount: parseFloat(amount),
      currency: currency.toLowerCase(),
      status: 'pending',
      customerEmail: customerEmail || undefined,
      checkoutSessionId: session.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      paymentId: paymentRecord.id,
    });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
