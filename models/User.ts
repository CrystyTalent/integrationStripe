import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { decrypt } from '@/lib/encryption';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  apiKeyHash?: string;
  stripeSecretKeyEncrypted?: string;
  stripePublishableKey?: string;
  webhookSecretEncrypted?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(password: string): Promise<boolean>;
  getDecryptedStripeSecretKey(): string;
  getDecryptedWebhookSecret(): string | undefined;
  compareApiKey(apiKey: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    apiKeyHash: {
      type: String,
      required: false,
    },
    stripeSecretKeyEncrypted: {
      type: String,
      required: false,
    },
    stripePublishableKey: {
      type: String,
      required: false,
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

// Index for faster lookups
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 });
UserSchema.index({ isActive: 1 });

// Hash password before saving
UserSchema.pre<IUser>('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Method to get decrypted Stripe secret key
UserSchema.methods.getDecryptedStripeSecretKey = function (): string {
  if (!this.stripeSecretKeyEncrypted) {
    throw new Error('Stripe secret key not configured');
  }
  return decrypt(this.stripeSecretKeyEncrypted);
};

// Method to get decrypted webhook secret
UserSchema.methods.getDecryptedWebhookSecret = function (): string | undefined {
  if (!this.webhookSecretEncrypted) return undefined;
  return decrypt(this.webhookSecretEncrypted);
};

// Method to compare API key
UserSchema.methods.compareApiKey = async function (apiKey: string): Promise<boolean> {
  if (!this.apiKeyHash) return false;
  return bcrypt.compare(apiKey, this.apiKeyHash);
};

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
