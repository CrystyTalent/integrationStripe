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
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-xl shadow-lg overflow-hidden p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-900/50 border border-green-700">
            <svg
              className="h-8 w-8 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
        <p className="text-gray-300 mb-6">
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

        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="block w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200"
          >
            View Dashboard
          </Link>
          <Link
            href="/create"
            className="block w-full bg-slate-700 text-gray-200 py-3 px-4 rounded-lg font-semibold hover:bg-slate-600 transition duration-200 border border-slate-600"
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
