# Subscription System Setup Guide

## Overview

The free/premium subscription system has been implemented. This guide covers the setup steps needed to get everything working.

## Prerequisites

### 1. Install Stripe Package

```bash
npm install stripe
```

### 2. Environment Variables

Add these to your `.env.local` file:

```env
# Stripe Keys (get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...  # Get from Stripe Dashboard > Webhooks

# Stripe Price IDs (create products/prices in Stripe Dashboard)
STRIPE_MONTHLY_PRICE_ID=price_...  # $5.99/month subscription (or use STRIPE_PRICE_ID_MONTHLY)
STRIPE_YEARLY_PRICE_ID=price_...   # $39/year subscription (or use STRIPE_PRICE_ID_ANNUAL)

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change for production
```

### 3. Create Stripe Products & Prices

1. Go to [Stripe Dashboard > Products](https://dashboard.stripe.com/products)
2. Create two products:
   - **Premium Monthly**: $5.99/month recurring
   - **Premium Annual**: $39/year recurring
3. Copy the Price IDs and add them to your `.env.local`

### 4. Set Up Stripe Webhook

1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook signing secret to `.env.local`

### 5. Seed Topics

Run this mutation in Convex Dashboard or via a script:

```typescript
// In Convex Dashboard > Functions > topics.seedTopics
// Or create a one-time script to call it
```

## Features Implemented

### Free Tier
- ✅ 5 pre-loaded topics
- ✅ 1 user-created deck
- ✅ 12 cards max per deck
- ✅ 12 cards max per study session
- ✅ Basic flashcard types only (basic, multiple_choice, true_false)
- ✅ 5 important cards max
- ✅ 30 days progress history
- ✅ No public deck sharing

### Premium Tier ($39/year or $5.99/month)
- ✅ 20+ premium topics
- ✅ Unlimited user-created decks
- ✅ Unlimited cards per deck
- ✅ Unlimited cards per study session
- ✅ All flashcard types (including code_snippet, fill_blank)
- ✅ Unlimited important cards
- ✅ Unlimited progress history
- ✅ Public deck sharing

## Testing Checklist

- [ ] Free user can access 5 free topics
- [ ] Free user cannot access premium topics (shows locked state)
- [ ] Free user can create 1 deck with max 12 cards
- [ ] Free user cannot create 2nd deck (shows upgrade prompt)
- [ ] Free user cannot add 13th card to deck (shows upgrade prompt)
- [ ] Free user limited to 12 cards per session
- [ ] Free user cannot use code_snippet/fill_blank types
- [ ] Free user limited to 5 important cards
- [ ] Premium user has unlimited access
- [ ] Stripe checkout works for monthly plan
- [ ] Stripe checkout works for annual plan
- [ ] Webhook updates subscription correctly
- [ ] Upgrade prompts appear at correct times

## Important Notes

1. **Convex API Regeneration**: After adding new Convex functions, run `npx convex dev` to regenerate the API types.

2. **Default User Plan**: All new users default to 'free' plan automatically.

3. **Subscription Status**: Subscription status is checked in real-time via Convex queries.

4. **Error Handling**: Feature limit errors include "FREE_LIMIT_REACHED" or "FREE_FEATURE_LOCKED" prefixes for easy client-side handling.

5. **Webhook Security**: The webhook endpoint verifies Stripe signatures for security.

## Next Steps

1. Install Stripe package
2. Set up Stripe products and prices
3. Configure environment variables
4. Set up webhook endpoint
5. Seed topics using `topics.seedTopics` mutation
6. Test the subscription flow end-to-end
7. Update production environment variables

## Support

If you encounter issues:
- Check Convex logs for subscription mutations
- Check Stripe Dashboard for payment events
- Verify webhook is receiving events
- Ensure environment variables are set correctly

