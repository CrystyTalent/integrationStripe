'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const paymentIntentId = searchParams.get('payment_intent');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Give webhook time to process
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900/20 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden p-8 text-center backdrop-blur-sm animate-in fade-in zoom-in-95 duration-500">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-2 border-green-500/50 animate-in zoom-in-95 duration-500">
            <svg
              className="h-10 w-10 text-green-400 animate-in scale-in-125 duration-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-3 animate-in slide-in-from-bottom-4 duration-500">Payment Successful!</h1>
        <p className="text-gray-300 mb-6 animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '0.1s' }}>
          Thank you for your payment. Your transaction has been processed successfully.
        </p>

        {(sessionId || paymentIntentId) && (
          <div className="mb-6 p-4 bg-slate-700/50 border border-slate-600 rounded-lg">
            <p className="text-sm text-gray-400 mb-1">
              {sessionId ? 'Session ID:' : 'Payment Intent ID:'}
            </p>
            <p className="text-xs font-mono text-gray-300 break-all">
              {sessionId || paymentIntentId}
            </p>
          </div>
        )}

        <div className="space-y-3 animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '0.2s' }}>
          <Link
            href="/dashboard"
            className="block w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 active:scale-95 transition-all duration-200 shadow-lg shadow-indigo-500/20"
          >
            View Dashboard
          </Link>
          <Link
            href="/checkout?amount=100.00&currency=usd&product=Payment&store=Store"
            className="block w-full bg-slate-700/50 text-gray-200 py-3 px-4 rounded-lg font-semibold hover:bg-slate-600/50 active:scale-95 transition-all duration-200 border border-slate-600/50"
          >
            Create Another Payment
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
