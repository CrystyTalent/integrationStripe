'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import Link from 'next/link';

interface CheckoutFormProps {
  amount: number;
  currency: string;
  productName: string;
  clientSecret: string;
  customerEmail: string;
  storeName?: string;
  successUrl?: string;
  cancelUrl?: string;
}

function CheckoutForm({ 
  amount, 
  currency, 
  productName, 
  clientSecret, 
  customerEmail,
  storeName = 'Store',
  successUrl,
  cancelUrl,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  
  const [email, setEmail] = useState(customerEmail);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError('');

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Card element not found');
      setLoading(false);
      return;
    }

    try {
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: name || undefined,
              email: email || undefined,
            },
          },
        }
      );

      if (confirmError) {
        setError(confirmError.message || 'Payment failed');
        setLoading(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Redirect to success URL if provided, otherwise default
        if (successUrl) {
          window.location.href = successUrl.replace('{PAYMENT_INTENT_ID}', paymentIntent.id);
        } else {
          router.push(`/success?payment_intent=${paymentIntent.id}`);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#f1f5f9',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        '::placeholder': {
          color: '#94a3b8',
          opacity: 0.7,
        },
        backgroundColor: 'transparent',
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    },
    hidePostalCode: true,
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Support Banner */}
      <div className="bg-slate-800/50 border-b border-slate-700/50 px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <p className="text-sm text-gray-300 text-center">
            If you didn't receive your product or are unhappy with your purchase, please contact{' '}
            <span className="text-indigo-400 font-semibold">{storeName}</span>
            {' '}for assistance or a possible refund.
          </p>
        </div>
      </div>

      {/* Main Checkout Card */}
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="p-6 md:p-8 border-b border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-xl">{storeName.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <span className="text-white font-semibold text-lg block">{storeName}</span>
                <span className="text-gray-400 text-xs">{productName}</span>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-3xl font-bold text-white">{formatCurrency(amount, currency)}</p>
              <p className="text-sm text-gray-400">Total</p>
            </div>
          </div>

          {/* Payment Options */}
          <div className="p-6 md:p-8">
            <div className="mb-8">
              <div className="border-t border-slate-700/50 my-4"></div>
              <p className="text-sm text-gray-400 text-center mb-4">
                To use Apple Pay, open on your mobile device
              </p>
              <div className="border-t border-slate-700/50 my-4"></div>
              <p className="text-sm text-gray-400 text-center mb-6">or pay with card</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 bg-red-900/30 border border-red-700/50 rounded-lg">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-white">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 text-white rounded-lg 
                             focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 
                             transition-all duration-200 placeholder:text-slate-400"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-white">
                  Card information
                </label>
                <div className="px-4 py-3.5 bg-slate-700/50 border border-slate-600/50 rounded-lg 
                                focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500
                                transition-all duration-200">
                  <CardElement options={cardElementOptions} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="name" className="block text-sm font-medium text-white">
                  Name on Card
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 text-white rounded-lg 
                             focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 
                             transition-all duration-200 placeholder:text-slate-400"
                  placeholder="Full Name"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !stripe}
                className="w-full bg-white text-black py-4 px-4 rounded-lg font-semibold 
                           hover:bg-gray-50 
                           focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-slate-800 
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white
                           transition-all duration-200"
              >
                {loading ? 'Processing...' : 'Purchase'}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="px-6 md:px-8 pb-6 md:pb-8 pt-4 border-t border-slate-700/50">
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>Powered by Stripe • Secure Payment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const token = searchParams.get('token');
  
  // Legacy parameters (for backward compatibility)
  const amount = searchParams.get('amount') || '100.00';
  const currency = searchParams.get('currency') || 'usd';
  const productName = searchParams.get('product') || 'Payment';
  const customerEmail = searchParams.get('email') || '';

  const [clientSecret, setClientSecret] = useState('');
  const [stripePublishableKey, setStripePublishableKey] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkoutData, setCheckoutData] = useState<{
    amount: number;
    currency: string;
    productName: string;
    customerEmail: string;
    storeName: string;
    successUrl?: string;
    cancelUrl?: string;
  } | null>(null);

  useEffect(() => {
    const initializeCheckout = async () => {
      try {
        if (token) {
          // Token-based checkout (multi-tenant)
          const response = await fetch(`/api/checkout/validate-token?token=${token}`);
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to validate token');
          }

          // Set store's Stripe publishable key
          setStripePublishableKey(data.store.stripePublishableKey);
          setStripePromise(loadStripe(data.store.stripePublishableKey));
          
          // Set checkout data
          setCheckoutData({
            amount: data.checkout.amount,
            currency: data.checkout.currency,
            productName: data.checkout.productName,
            customerEmail: data.checkout.customerEmail || '',
            storeName: data.store.storeName,
            successUrl: data.checkout.successUrl,
            cancelUrl: data.checkout.cancelUrl,
          });
          
          setClientSecret(data.checkout.clientSecret);
        } else {
          // Legacy checkout (backward compatibility)
          const defaultKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
          if (!defaultKey) {
            throw new Error('Stripe publishable key not configured');
          }
          
          setStripePublishableKey(defaultKey);
          setStripePromise(loadStripe(defaultKey));
          
          // Create payment intent using legacy API
          const response = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount,
              currency,
              productName,
              customerEmail,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to create payment intent');
          }

          setCheckoutData({
            amount: parseFloat(amount),
            currency,
            productName,
            customerEmail,
            storeName: 'Store',
          });
          
          setClientSecret(data.clientSecret);
        }
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    initializeCheckout();
  }, [token, amount, currency, productName, customerEmail]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-indigo-500"></div>
          <p className="text-gray-400 text-sm">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 text-red-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-400 mb-6 font-medium">{error}</p>
          <Link
            href="/"
            className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200"
          >
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  if (!clientSecret || !checkoutData || !stripePromise) {
    return null;
  }

  return (
    <>
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: 'night',
          },
        }}
      >
        <CheckoutForm
          amount={checkoutData.amount}
          currency={checkoutData.currency}
          productName={checkoutData.productName}
          clientSecret={clientSecret}
          customerEmail={checkoutData.customerEmail}
          storeName={checkoutData.storeName}
          successUrl={checkoutData.successUrl}
          cancelUrl={checkoutData.cancelUrl}
        />
      </Elements>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-indigo-500"></div>
          <p className="text-gray-400 text-sm">Loading checkout...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}