import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center text-white">
        <h1 className="text-5xl font-bold mb-6">Stripe Payment System</h1>
        <p className="text-xl mb-8 opacity-90">
          Complete payment integration with checkout and dashboard
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <Link
            href="/checkout?amount=100.00&currency=usd&product=Test%20Product&store=MyStore"
            className="bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-indigo-700 active:scale-95 transition-all duration-200 text-center shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span>Checkout</span>
          </Link>
          <Link
            href="/dashboard"
            className="bg-slate-800/50 text-white px-8 py-4 rounded-lg font-semibold hover:bg-slate-700/50 active:scale-95 transition-all duration-200 border-2 border-indigo-600/50 hover:border-indigo-500 text-center backdrop-blur-sm flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>View Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
