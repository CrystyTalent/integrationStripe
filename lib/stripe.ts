import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true,
});

// In-memory storage for payments (in production, use a database)
export interface PaymentRecord {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  customerEmail?: string;
  paymentIntentId?: string;
  checkoutSessionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Simple in-memory store (replace with database in production)
const paymentStore = new Map<string, PaymentRecord>();

export const paymentStoreFunctions = {
  create: (payment: PaymentRecord) => {
    paymentStore.set(payment.id, payment);
    return payment;
  },
  update: (id: string, updates: Partial<PaymentRecord>) => {
    const existing = paymentStore.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    paymentStore.set(id, updated);
    return updated;
  },
  get: (id: string) => paymentStore.get(id) || null,
  getAll: () => Array.from(paymentStore.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
  getByStatus: (status: PaymentRecord['status']) => 
    Array.from(paymentStore.values())
      .filter(p => p.status === status)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
};
