import type { Metadata } from 'next';
import './globals.css';

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
      <body>{children}</body>
    </html>
  );
}
