# Stripe Payment System

A complete Next.js application for processing Stripe payments with a dashboard to track payment statuses.

## Features

- ✅ Stripe Checkout integration
- ✅ Payment API endpoints for integration
- ✅ Dashboard with payment status tracking (Completed, Pending, Failed)
- ✅ Real-time payment status updates
- ✅ Webhook handling for payment events

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your key
STRIPE_SECRET_KEY=your key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
STRIPE_WEBHOOK_SECRET=your_webhook_secret_here
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Integration

### Create Checkout Session

**Endpoint:** `POST /api/create-checkout-session`

**Request Body:**
```json
{
  "amount": "100.00",
  "currency": "usd",
  "productName": "Product Name",
  "customerEmail": "customer@example.com"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/...",
  "paymentId": "cs_test_..."
}
```

### Get Payments

**Endpoint:** `GET /api/payments?status=completed`

**Query Parameters:**
- `status` (optional): Filter by status (`pending`, `completed`, `failed`)

**Response:**
```json
{
  "payments": [
    {
      "id": "cs_test_...",
      "amount": 100,
      "currency": "usd",
      "status": "completed",
      "customerEmail": "customer@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Webhook Endpoint

**Endpoint:** `POST /api/webhook`

This endpoint handles Stripe webhook events to update payment statuses automatically.

## Pages

- `/` - Home page
- `/checkout` - Create payment checkout
- `/dashboard` - View all payments with status filters
- `/success` - Payment success page

## Integration Guide

To integrate this payment system into any website:

1. **Use the Checkout API:**
   ```javascript
   const response = await fetch('https://your-domain.com/api/create-checkout-session', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       amount: '100.00',
       currency: 'usd',
       productName: 'Your Product',
       customerEmail: 'customer@example.com'
     })
   });
   
   const data = await response.json();
   window.location.href = data.url; // Redirect to Stripe Checkout
   ```

2. **Check Payment Status:**
   ```javascript
   const response = await fetch('https://your-domain.com/api/payments?status=completed');
   const data = await response.json();
   console.log(data.payments);
   ```

## Webhook Setup

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhook`
3. Select events:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy the webhook secret and add it to `.env.local` as `STRIPE_WEBHOOK_SECRET`

## Notes

- Currently uses in-memory storage for payments (suitable for development)
- For production, replace the in-memory store in `lib/stripe.ts` with a database
- Make sure to set up webhooks for automatic payment status updates

## Production Deployment

1. Set `NEXT_PUBLIC_BASE_URL` to your production domain
2. Set up webhook endpoint in Stripe Dashboard
3. Replace in-memory storage with a database
4. Use environment variables for all sensitive keys
