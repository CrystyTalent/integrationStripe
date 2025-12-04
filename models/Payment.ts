import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  storeId: mongoose.Types.ObjectId;
  paymentIntentId?: string;
  checkoutSessionId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'canceled';
  customerEmail?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    paymentIntentId: {
      type: String,
      required: false,
      index: true,
    },
    checkoutSessionId: {
      type: String,
      required: false,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      default: 'USD',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'canceled'],
      default: 'pending',
      index: true,
    },
    customerEmail: {
      type: String,
      required: false,
    },
    metadata: {
      type: Schema.Types.Mixed,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster lookups
PaymentSchema.index({ storeId: 1, status: 1 });
PaymentSchema.index({ storeId: 1, createdAt: -1 });
PaymentSchema.index({ paymentIntentId: 1 });
PaymentSchema.index({ checkoutSessionId: 1 });

const Payment = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;
