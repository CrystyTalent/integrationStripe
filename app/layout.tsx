import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import UserMenu from '@/components/UserMenu';

export const metadata: Metadata = {
  title: 'Stripe Payment System',
  description: 'Complete Stripe payment integration with dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="bg-slate-900 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-xl font-bold text-white">
                Stripe Payment System
              </Link>
              <UserMenu />
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
