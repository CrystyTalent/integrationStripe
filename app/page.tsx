import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center text-white">
        <h1 className="text-5xl font-bold mb-6">Stripe Payment System</h1>
        <p className="text-xl mb-8 opacity-90">
          Complete payment integration with checkout and dashboard
        </p>
        <div className="space-y-4">
          <div className="flex justify-center space-x-4 flex-wrap gap-4">
            <Link
              href="/create"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200"
            >
              Create Payment
            </Link>
            <Link
              href="/dashboard"
              className="bg-slate-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-slate-700 transition duration-200 border-2 border-indigo-600"
            >
              View Dashboard
            </Link>
          </div>
          <div className="flex justify-center space-x-4 flex-wrap gap-4 mt-6">
            <Link
              href="/login"
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-200"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
            >
              Register User
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
