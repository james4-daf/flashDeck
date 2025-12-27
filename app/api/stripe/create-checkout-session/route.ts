// app/api/stripe/create-checkout-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

// Price IDs from Stripe dashboard (to be configured)
const PRICE_IDS = {
  monthly: process.env.STRIPE_MONTHLY_PRICE_ID || process.env.STRIPE_PRICE_ID_MONTHLY || 'price_monthly', // $5.99/month
  annual: process.env.STRIPE_YEARLY_PRICE_ID || process.env.STRIPE_PRICE_ID_ANNUAL || 'price_annual', // $39/year
};

// Validate that a price ID is valid (starts with 'price_')
function isValidPriceId(priceId: string): boolean {
  return priceId.startsWith('price_');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, priceId, billingCycle } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 },
      );
    }

    // Determine price ID if not provided
    const finalPriceId =
      priceId || (billingCycle === 'annual' ? PRICE_IDS.annual : PRICE_IDS.monthly);

    // Validate price ID format
    if (!isValidPriceId(finalPriceId)) {
      console.error(`Invalid price ID format: ${finalPriceId}. Price IDs must start with 'price_'.`);
      return NextResponse.json(
        { 
          error: 'Invalid price configuration. Please check your Stripe price IDs. Price IDs must start with "price_" (not "prod_").',
          details: `Received: ${finalPriceId}`
        },
        { status: 400 },
      );
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?canceled=true`,
      client_reference_id: userId,
      metadata: {
        userId,
        billingCycle: billingCycle || (finalPriceId === PRICE_IDS.annual ? 'annual' : 'monthly'),
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 },
    );
  }
}

