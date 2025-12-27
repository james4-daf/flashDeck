// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Initialize Convex client for server-side calls
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  console.log('Webhook received');
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log('Webhook signature verified, event type:', event.type);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', errorMessage);
    return NextResponse.json(
      { error: `Webhook Error: ${errorMessage}` },
      { status: 400 },
    );
  }

  try {
    console.log(`Processing webhook event: ${event.type}`);
    
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session completed:', {
          sessionId: session.id,
          metadata: session.metadata,
          clientReferenceId: session.client_reference_id,
        });

        const userId = session.metadata?.userId || session.client_reference_id;

        if (!userId) {
          console.error('No userId in checkout session', {
            metadata: session.metadata,
            clientReferenceId: session.client_reference_id,
          });
          break;
        }

        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        if (!subscriptionId) {
          console.error('No subscription ID in checkout session');
          break;
        }

        console.log('Retrieving subscription from Stripe:', subscriptionId);

        // Get subscription details from Stripe
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price.id;
        const billingCycle =
          subscription.items.data[0]?.price.recurring?.interval === 'year'
            ? 'annual'
            : 'monthly';

        // Calculate subscription end date
        // Note: current_period_end is a number (Unix timestamp in seconds)
        // Using type assertion to handle Stripe API version differences
        const subscriptionEndsAt =
          (subscription as unknown as { current_period_end: number }).current_period_end * 1000; // Convert to milliseconds

        console.log('Creating subscription in Convex:', {
          userId,
          plan: 'premium',
          status: 'active',
          billingCycle,
          subscriptionEndsAt: new Date(subscriptionEndsAt).toISOString(),
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          stripePriceId: priceId,
        });

        // Create or update subscription in Convex
        try {
          const result = await convex.mutation(api.subscriptions.createSubscription, {
            userId,
            plan: 'premium',
            status: 'active',
            billingCycle,
            subscriptionEndsAt,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            stripePriceId: priceId,
          });
          console.log('Subscription created successfully:', result);
        } catch (convexError) {
          const errorMessage = convexError instanceof Error ? convexError.message : 'Unknown error';
          const errorStack = convexError instanceof Error ? convexError.stack : undefined;
          console.error('Error creating subscription in Convex:', {
            error: errorMessage,
            stack: errorStack,
            userId,
          });
          throw convexError;
        }

        break;
      }

      case 'customer.subscription.updated': {
        // const subscription = event.data.object as Stripe.Subscription;
        // const customerId = subscription.customer as string;

        // Find user by customer ID (we'll need to query Convex)
        // For now, we'll handle this in the update mutation
        // const priceId = subscription.items.data[0]?.price.id;
        // const billingCycle =
        //   subscription.items.data[0]?.price.recurring?.interval === 'year'
        //     ? 'annual'
        //     : 'monthly';
        // const subscriptionEndsAt = subscription.current_period_end * 1000;

        // Note: We need the userId, which we can get from the subscription metadata
        // or by querying Convex subscriptions table by stripeCustomerId
        // For now, we'll update based on customer ID match
        // This is a limitation - ideally store userId in Stripe customer metadata

        break;
      }

      case 'customer.subscription.deleted': {
        // const subscription = event.data.object as Stripe.Subscription;
        // const customerId = subscription.customer as string;

        // Find subscription by customer ID and cancel it
        // Note: This requires querying Convex by stripeCustomerId
        // For now, we'll handle cancellation through the portal

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        // Using type assertion to handle Stripe API version differences
        const subscriptionId = (invoice as unknown as { subscription: string | null }).subscription as string | null;
        // const customerId = invoice.customer as string;

        if (subscriptionId) {
          // const subscription = await stripe.subscriptions.retrieve(
          //   subscriptionId,
          // );
          // const subscriptionEndsAt = subscription.current_period_end * 1000;

          // Update subscription end date
          // Note: Need userId lookup by customerId
        }

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Handle failed payment
        // Could send email notification or update subscription status
        console.log('Payment failed for customer:', customerId);

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 },
    );
  }
}

