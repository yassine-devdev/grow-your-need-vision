# Payment Processing Setup Guide

## Quick Start

### Step 1: Install Stripe Dependencies
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### Step 2: Create Database Collections
```bash
node init-payment-collections.cjs
```

This creates:
- `payment_intents` - Transaction tracking
- `subscriptions` - Recurring billing
- `payment_methods` - Saved payment cards

### Step 3: Add Environment Variables

Update your `.env` file:

```env
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
VITE_ENABLE_PAYMENTS=true

# Backend (if using serverless)
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### Step 4: Get Stripe Keys

1. Go to https://dashboard.stripe.com/register
2. Create account (use test mode)
3. Navigate to **Developers** → **API keys**
4. Copy **Publishable key** (starts with `pk_test_`)
5. Copy **Secret key** (starts with `sk_test_`)

## Testing

### Test Cards

Use these card numbers in Stripe test mode:

| Card Type | Number | Result |
|-----------|--------|--------|
| Success | `4242 4242 4242 4242` | Payment succeeds |
| Decline | `4000 0000 0000 0002` | Card declined |
| 3D Secure | `4000 0027 6000 3184` | Requires authentication |
| Insufficient Funds | `4000 0000 0000 9995` | Insufficient funds |

**Expiry**: Any future date (e.g., 12/25)  
**CVV**: Any 3 digits (e.g., 123)  
**Zip**: Any 5 digits (e.g., 12345)

## What's Implemented

✅ **Payment Service** (`src/services/paymentService.ts`)
- Create payment intents
- Manage subscriptions
- Handle payment methods
- Track payment history

✅ **TypeScript Types** (`src/types/payment.ts`)
- Complete type definitions
- Payment intents, subscriptions, invoices

✅ **Database Collections**
- Schema with proper relations
- Access control rules
- PocketBase integration

## What's Needed

🔄 **Backend API Endpoints**
- Payment intent creation
- Subscription management
- Webhook handling

🔄 **Frontend Components**
- Checkout form
- Subscription cards
- Payment method manager

🔄 **Stripe Integration**
- Stripe.js initialization
- Elements components
- Payment confirmation flow

## Architecture

```
Frontend (React)
  ↓ paymentService
Backend API (/api/payments/*)
  ↓ Stripe SDK
Stripe API
  ↓ Webhooks
Backend Webhook Handler
  ↓ Updates
PocketBase Database
```

## Subscription Plans

Three plans are configured in `paymentService.getSubscriptionPlans()`:

1. **Basic** - $29/month
   - 100 students, 5GB storage
   
2. **Professional** - $79/month  
   - 500 students, 50GB storage
   
3. **Enterprise** - $199/month
   - Unlimited students, 500GB storage

## Next Steps

1. Create backend API (choose one):
   - Serverless functions (Vercel/Netlify) ✅ Recommended
   - Node.js Express server
   - PocketBase custom routes (Go)

2. Build frontend components:
   - Checkout page
   - Subscription management
   - Payment history

3. Deploy and test:
   - Test mode validation
   - Production deployment
   - Real payment testing

## Support

- Stripe Docs: https://stripe.com/docs
- Stripe Test Mode: https://stripe.com/docs/testing
- PocketBase: https://pocketbase.io/docs

---

**Status**: Foundation Complete ✅  
**Ready for**: Backend API & UI Components
