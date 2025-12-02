import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { paymentStoreFunctions } from '@/lib/stripe';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.warn('STRIPE_WEBHOOK_SECRET not set, skipping signature verification');
      // In development, you can parse without verification, but this is not secure for production
      event = JSON.parse(body);
    } else {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    }
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const paymentIntentId = session.payment_intent as string;
        
        // Update payment status to completed
        const payment = paymentStoreFunctions.get(session.id);
        if (payment) {
          paymentStoreFunctions.update(session.id, {
            status: 'completed',
            paymentIntentId,
          });
        } else {
          // Create new payment record if it doesn't exist
          paymentStoreFunctions.create({
            id: session.id,
            amount: (session.amount_total || 0) / 100,
            currency: session.currency || 'usd',
            status: 'completed',
            customerEmail: session.customer_email || undefined,
            paymentIntentId,
            checkoutSessionId: session.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        break;
      }

      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;
        const paymentIntentId = session.payment_intent as string;
        
        paymentStoreFunctions.update(session.id, {
          status: 'completed',
          paymentIntentId,
        });
        break;
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        paymentStoreFunctions.update(session.id, {
          status: 'failed',
        });
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Find and update payment by payment_intent_id
        const allPayments = paymentStoreFunctions.getAll();
        const payment = allPayments.find(p => p.paymentIntentId === paymentIntent.id);
        
        if (payment) {
          paymentStoreFunctions.update(payment.id, {
            status: 'completed',
            paymentIntentId: paymentIntent.id,
          });
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Find and update payment by payment_intent_id
        const allPayments = paymentStoreFunctions.getAll();
        const payment = allPayments.find(p => p.paymentIntentId === paymentIntent.id);
        
        if (payment) {
          paymentStoreFunctions.update(payment.id, {
            status: 'failed',
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
