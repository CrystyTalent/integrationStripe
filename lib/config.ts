/**
 * Get the base URL for the application
 * Automatically uses production URL in production, localhost for development
 * 
 * Priority:
 * 1. NEXT_PUBLIC_BASE_URL (if explicitly set)
 * 2. Production URL (https://integration-stripe.vercel.app) if NODE_ENV === 'production'
 * 3. Development URL (http://localhost:3000) for development
 */
export function getBaseUrl(): string {
  // Allow explicit override via environment variable
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  // In production mode, use the production URL
  if (process.env.NODE_ENV === 'production') {
    return 'https://integration-stripe.vercel.app';
  }

  // Default to localhost for development
  return 'http://localhost:3000';
}

/**
 * Get the base URL for client-side usage
 * This is safe to use in client components
 */
export function getClientBaseUrl(): string {
  // In production on Vercel, use the production URL
  if (typeof window !== 'undefined') {
    // Client-side: use current origin
    return window.location.origin;
  }

  // Server-side: use the same logic as getBaseUrl
  return getBaseUrl();
}
