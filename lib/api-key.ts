import crypto from 'crypto';

/**
 * Generate a new API key for stores
 * Format: pk_live_<32 random hex characters>
 */
export function generateApiKey(): string {
  return `pk_live_${crypto.randomBytes(32).toString('hex')}`;
}

/**
 * Generate a checkout token
 * Format: checkout_<32 random hex characters>
 */
export function generateCheckoutToken(): string {
  return `checkout_${crypto.randomBytes(32).toString('hex')}`;
}

/**
 * Validate API key format
 */
export function isValidApiKeyFormat(apiKey: string): boolean {
  return apiKey.startsWith('pk_live_') && apiKey.length === 73; // 8 + 1 + 64
}
