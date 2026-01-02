// app/api/stripe/create-portal-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_request: NextRequest) {
  try {
    // Verify authentication - this is the security fix
    const { userId: authenticatedUserId } = await auth();

    if (!authenticatedUserId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to manage your subscription' },
        { status: 401 },
      );
    }

    // Get the user's subscription to verify ownership
    const subscription = await convex.query(api.subscriptions.getUserSubscription, {
      userId: authenticatedUserId,
    });

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No subscription found', message: 'You do not have an active subscription to manage' },
        { status: 404 },
      );
    }

    // Create portal session using the verified customer ID
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create portal session';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    );
  }
}
