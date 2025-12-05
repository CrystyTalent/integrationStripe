import mongoose, { Document, Schema } from 'mongoose';

export interface ICheckoutToken extends Document {
  token: string;
  userId: mongoose.Types.ObjectId;
  paymentIntentId?: string;
  amount: number;
  currency: string;
  productName: string;
  customerEmail?: string;
  successUrl?: string;
  cancelUrl?: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

const CheckoutTokenSchema = new Schema<ICheckoutToken>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    paymentIntentId: {
      type: String,
      required: false,
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
    productName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: false,
    },
    successUrl: {
      type: String,
      required: false,
    },
    cancelUrl: {
      type: String,
      required: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // Auto-delete expired tokens
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster lookups
CheckoutTokenSchema.index({ token: 1, used: 1 });
CheckoutTokenSchema.index({ userId: 1, used: 1 });
CheckoutTokenSchema.index({ expiresAt: 1 });

const CheckoutToken = mongoose.models.CheckoutToken || mongoose.model<ICheckoutToken>('CheckoutToken', CheckoutTokenSchema);

export default CheckoutToken;
