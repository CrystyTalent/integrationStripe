import mongoose, { Document, Schema } from 'mongoose';
import { decrypt } from '@/lib/encryption';
import bcrypt from 'bcrypt';

export interface IStore extends Document {
  storeName: string;
  email: string;
  apiKeyHash: string;
  stripeSecretKeyEncrypted: string;
  stripePublishableKey: string;
  webhookSecretEncrypted?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  getDecryptedStripeSecretKey(): string;
  getDecryptedWebhookSecret(): string | undefined;
  compareApiKey(apiKey: string): Promise<boolean>;
}

const StoreSchema = new Schema<IStore>(
  {
    storeName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    apiKeyHash: {
      type: String,
      required: true,
    },
    stripeSecretKeyEncrypted: {
      type: String,
      required: true,
    },
    stripePublishableKey: {
      type: String,
      required: true,
    },
    webhookSecretEncrypted: {
      type: String,
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

StoreSchema.methods.getDecryptedStripeSecretKey = function (): string {
  return decrypt(this.stripeSecretKeyEncrypted);
};

StoreSchema.methods.getDecryptedWebhookSecret = function ():
  | string
  | undefined {
  if (!this.webhookSecretEncrypted) return undefined;
  return decrypt(this.webhookSecretEncrypted);
};

StoreSchema.methods.compareApiKey = async function (
  apiKey: string
): Promise<boolean> {
  return bcrypt.compare(apiKey, this.apiKeyHash);
};

StoreSchema.index({ email: 1 }, { unique: true });
StoreSchema.index({ isActive: 1 });

const Store =
  mongoose.models.Store || mongoose.model<IStore>('Store', StoreSchema);

export default Store;


