# Setup Guide - Multi-Tenant Stripe Payment System

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up MongoDB

**Option A: Local MongoDB**
- Install MongoDB locally
- Start MongoDB service
- Update `MONGODB_URI` in `.env.local`

**Option B: MongoDB Atlas (Cloud)**
- Create account at https://www.mongodb.com/cloud/atlas
- Create a cluster
- Get connection string
- Update `MONGODB_URI` in `.env.local`

**Option C: Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mongo
```

### 3. Create Environment File

Create `.env.local` in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/stripe-payment-system

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Encryption Key (REQUIRED - Generate one first!)
ENCRYPTION_KEY=your-32-byte-key-here

# Optional: For legacy/backward compatibility
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Generate Encryption Key:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use it as `ENCRYPTION_KEY`.

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## First Steps

### 1. Register a Store

1. Go to http://localhost:3000/register/store
2. Fill in the form:
   - Store Name
   - Email
   - Stripe Publishable Key (from your Stripe Dashboard)
   - Stripe Secret Key (from your Stripe Dashboard)
   - Webhook Secret (optional, from Stripe webhook settings)
3. Submit the form
4. **IMPORTANT**: Copy and save your API key - it won't be shown again!

### 2. Test the API

Use your API key to create a checkout session:

```bash
curl -X POST http://localhost:3000/api/v1/checkout/create \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "100.00",
    "currency": "usd",
    "productName": "Test Product",
    "customerEmail": "customer@example.com"
  }'
```

This will return a checkout URL. Open it in a browser to test the checkout flow.

## Features

✅ Multi-tenant architecture - Each store uses their own Stripe account
✅ Secure API key authentication
✅ Encrypted storage of Stripe credentials
✅ Token-based checkout sessions (30-minute expiration)
✅ Store and User registration pages
✅ Public API endpoints (v1)
✅ Payment tracking per store
✅ Backward compatible with legacy checkout

## API Endpoints

### Public API (v1)

All require `Authorization: Bearer <api_key>` header.

- `POST /api/v1/checkout/create` - Create checkout session
- `GET /api/v1/payments` - List payments (with filters)
- `GET /api/v1/payments/:id` - Get payment details

### Registration

- `POST /api/register/store` - Register a new store
- `POST /api/register/user` - Register a new user

### Pages

- `/register/store` - Store registration page
- `/register/user` - User registration page
- `/checkout?token=...` - Checkout page (token-based)
- `/checkout?amount=...` - Checkout page (legacy)

## Security Notes

1. **API Keys**: Store them securely. They cannot be retrieved after registration.
2. **Encryption Key**: Keep `ENCRYPTION_KEY` secret. Never commit it to git.
3. **Stripe Keys**: Your Stripe secret keys are encrypted in the database.
4. **Tokens**: Checkout tokens expire after 30 minutes.

## Troubleshooting

### MongoDB Connection Error

- Check MongoDB is running: `mongosh` or `mongo`
- Verify `MONGODB_URI` is correct
- Check firewall/network settings

### Encryption Error

- Ensure `ENCRYPTION_KEY` is set in `.env.local`
- Key must be 32 bytes (64 hex characters)
- Generate a new key if needed

### API Key Not Working

- Verify the API key format: `pk_live_...`
- Check the store is active
- Ensure API key is in `Authorization: Bearer <key>` header

## Production Deployment

1. Set environment variables on your hosting platform (Vercel, etc.)
2. Use MongoDB Atlas for production database
3. Set `NEXT_PUBLIC_BASE_URL` to your production domain
4. Use strong, random encryption key
5. Enable HTTPS only
6. Set up Stripe webhooks in production mode

## Support

For detailed API documentation, see `API_DOCUMENTATION.md`
