# Stripe Payment System - Public API Documentation

## Overview

This is a multi-tenant Stripe payment integration system that allows multiple stores/users to use a shared checkout page with their own Stripe accounts.

## Setup

### 1. Environment Variables

Create a `.env.local` file with the following:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/stripe-payment-system

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Encryption Key (REQUIRED - generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
ENCRYPTION_KEY=your-32-byte-encryption-key-here

# Optional: Legacy Stripe keys (for backward compatibility)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. MongoDB Setup

Make sure MongoDB is running. You can use:
- Local MongoDB instance
- MongoDB Atlas (cloud)
- Docker: `docker run -d -p 27017:27017 mongo`

## Registration

### Store Registration

Stores need to register first to get an API key.

**Endpoint:** `POST /api/register/store`

**Request Body:**
```json
{
  "storeName": "My Store",
  "email": "store@example.com",
  "stripeSecretKey": "sk_test_...",
  "stripePublishableKey": "pk_test_...",
  "webhookSecret": "whsec_..." // Optional
}
```

**Response:**
```json
{
  "message": "Store registered successfully",
  "store": {
    "id": "...",
    "storeName": "My Store",
    "email": "store@example.com",
    "isActive": true
  },
  "apiKey": "pk_live_abc123...",
  "warning": "Please save this API key securely. It will not be shown again."
}
```

**Web Interface:** Visit `/register/store` for a user-friendly registration form.

### User Registration

Users can register to access the system (for admin/store owner roles).

**Endpoint:** `POST /api/register/user`

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "customer", // "admin" | "store_owner" | "customer"
  "storeId": "store_id_here" // Required if role is "store_owner"
}
```

**Web Interface:** Visit `/register/user` for a user-friendly registration form.

## Public API (v1)

All v1 API endpoints require authentication using an API key in the Authorization header.

### Authentication

Include your API key in the request header:
```
Authorization: Bearer pk_live_abc123...
```

### Create Checkout Session

**Endpoint:** `POST /api/v1/checkout/create`

**Headers:**
```
Authorization: Bearer <your_api_key>
Content-Type: application/json
```

**Request Body:**
```json
{
  "amount": "100.00",
  "currency": "usd",
  "productName": "My Product",
  "customerEmail": "customer@example.com",
  "successUrl": "https://yourstore.com/success?payment_intent={PAYMENT_INTENT_ID}", // Optional
  "cancelUrl": "https://yourstore.com/cancel" // Optional
}
```

**Response:**
```json
{
  "checkoutUrl": "https://your-domain.com/checkout?token=checkout_abc123...",
  "token": "checkout_abc123...",
  "paymentIntentId": "pi_abc123...",
  "amount": 100,
  "currency": "usd",
  "expiresAt": "2024-01-01T12:30:00.000Z"
}
```

**Usage Example:**
```javascript
const response = await fetch('https://your-domain.com/api/v1/checkout/create', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer pk_live_abc123...',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount: '100.00',
    currency: 'usd',
    productName: 'My Product',
    customerEmail: 'customer@example.com',
  }),
});

const data = await response.json();
// Redirect customer to data.checkoutUrl
window.location.href = data.checkoutUrl;
```

### Get Payments

**Endpoint:** `GET /api/v1/payments`

**Query Parameters:**
- `status` (optional): Filter by status (`pending`, `completed`, `failed`, `canceled`)
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "payments": [
    {
      "_id": "...",
      "storeId": "...",
      "paymentIntentId": "pi_abc123...",
      "amount": 100,
      "currency": "USD",
      "status": "completed",
      "customerEmail": "customer@example.com",
      "createdAt": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:05:00.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

### Get Payment by ID

**Endpoint:** `GET /api/v1/payments/:paymentId`

**Response:**
```json
{
  "payment": {
    "_id": "...",
    "storeId": "...",
    "paymentIntentId": "pi_abc123...",
    "amount": 100,
    "currency": "USD",
    "status": "completed",
    "customerEmail": "customer@example.com",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:05:00.000Z"
  }
}
```

## Checkout Page

The checkout page supports two modes:

### 1. Token-based (Multi-tenant)

When a store creates a checkout session, they receive a checkout URL with a token:
```
https://your-domain.com/checkout?token=checkout_abc123...
```

The checkout page will:
- Validate the token
- Load the store's Stripe publishable key
- Display the checkout form
- Process payment using the store's Stripe account

### 2. Legacy (Backward Compatible)

The checkout page also supports legacy query parameters:
```
https://your-domain.com/checkout?amount=100&currency=usd&product=Product&email=customer@example.com
```

This uses the default Stripe account configured in environment variables.

## Database Schema

### Store
- `storeName`: Store name
- `email`: Store email (unique)
- `apiKeyHash`: Hashed API key
- `stripeSecretKeyEncrypted`: Encrypted Stripe secret key
- `stripePublishableKey`: Stripe publishable key
- `webhookSecretEncrypted`: Encrypted webhook secret (optional)
- `isActive`: Whether store is active

### User
- `username`: Username (unique)
- `email`: Email (unique)
- `password`: Hashed password
- `role`: User role (`admin`, `store_owner`, `customer`)
- `storeId`: Reference to store (if role is `store_owner`)
- `isActive`: Whether user is active

### CheckoutToken
- `token`: Unique token string
- `storeId`: Reference to store
- `paymentIntentId`: Stripe payment intent ID
- `amount`: Payment amount
- `currency`: Payment currency
- `productName`: Product name
- `customerEmail`: Customer email
- `successUrl`: Success redirect URL
- `cancelUrl`: Cancel redirect URL
- `expiresAt`: Token expiration date
- `used`: Whether token has been used

### Payment
- `storeId`: Reference to store
- `paymentIntentId`: Stripe payment intent ID
- `checkoutSessionId`: Stripe checkout session ID (optional)
- `amount`: Payment amount
- `currency`: Payment currency
- `status`: Payment status
- `customerEmail`: Customer email
- `metadata`: Additional metadata

## Security Features

1. **API Key Authentication**: All API requests require a valid API key
2. **Encryption**: Stripe secret keys are encrypted at rest
3. **Token System**: Checkout tokens expire after 30 minutes
4. **Store Isolation**: Stores can only access their own payments
5. **Password Hashing**: User passwords are hashed using bcrypt

## Error Handling

All API endpoints return standard HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized (invalid API key)
- `403`: Forbidden (store inactive)
- `404`: Not Found
- `409`: Conflict (duplicate)
- `500`: Internal Server Error

Error responses follow this format:
```json
{
  "error": "Error message here"
}
```

## Support

For issues or questions, please contact support.
