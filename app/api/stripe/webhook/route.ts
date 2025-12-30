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
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const subscriptionId = subscription.id;

        console.log('Subscription updated:', {
          subscriptionId,
          customerId,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          currentPeriodEnd: (subscription as unknown as { current_period_end: number }).current_period_end,
        });

        // Find subscription in Convex by Stripe subscription ID
        const convexSubscription = await convex.query(
          api.subscriptions.getSubscriptionByStripeId,
          {
            stripeSubscriptionId: subscriptionId,
          },
        );

        if (!convexSubscription) {
          console.error('Subscription not found in Convex:', subscriptionId);
          break;
        }

        // If subscription is immediately cancelled (refund scenario), delete the record
        if (subscription.status === 'canceled' && !subscription.cancel_at_period_end) {
          console.log('Subscription immediately cancelled (refund) - deleting record');
          await convex.mutation(api.subscriptions.deleteSubscriptionByStripeId, {
            stripeSubscriptionId: subscriptionId,
          });
          break;
        }

        const priceId = subscription.items.data[0]?.price.id;
        const billingCycle =
          subscription.items.data[0]?.price.recurring?.interval === 'year'
            ? 'annual'
            : 'monthly';
        const subscriptionEndsAt = (subscription as unknown as { current_period_end: number }).current_period_end * 1000;

        // Determine status based on Stripe subscription
        let status: 'active' | 'cancelled' | 'expired' = 'active';
        let plan: 'premium' | 'free' = 'premium';

        if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
          status = 'cancelled';
          plan = 'free';
        } else if (subscription.status === 'past_due') {
          // Still active but payment failed - keep as active for now
          status = 'active';
        } else if (subscription.cancel_at_period_end) {
          // Cancelled but active until period ends (cancel auto-renewal)
          status = 'cancelled';
          plan = 'premium'; // Still premium until period ends
        } else if (subscription.status === 'active') {
          status = 'active';
          plan = 'premium';
        }

        // Update subscription in Convex
        await convex.mutation(api.subscriptions.updateSubscription, {
          userId: convexSubscription.userId,
          updates: {
            status,
            plan,
            billingCycle,
            subscriptionEndsAt,
            stripePriceId: priceId,
          },
        });

        console.log('Subscription updated in Convex:', {
          userId: convexSubscription.userId,
          status,
          plan,
        });

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.id;

        console.log('Subscription deleted:', {
          subscriptionId,
        });

        // Delete subscription record entirely (refund scenario - immediate access removal)
        try {
          await convex.mutation(api.subscriptions.deleteSubscriptionByStripeId, {
            stripeSubscriptionId: subscriptionId,
          });
          console.log('Subscription deleted from Convex:', subscriptionId);
        } catch (error) {
          console.error('Error deleting subscription:', error);
          // If deletion fails, try to mark as cancelled as fallback
          const convexSubscription = await convex.query(
            api.subscriptions.getSubscriptionByStripeId,
            {
              stripeSubscriptionId: subscriptionId,
            },
          );

          if (convexSubscription) {
            await convex.mutation(api.subscriptions.updateSubscription, {
              userId: convexSubscription.userId,
              updates: {
                status: 'cancelled',
                plan: 'free',
                subscriptionEndsAt: Date.now(),
              },
            });
          }
        }

        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const customerId = charge.customer as string;

        console.log('Charge refunded:', {
          chargeId: charge.id,
          customerId,
          amount: charge.amount,
        });

        // Find subscription by customer ID and delete it (refund = immediate access removal)
        if (customerId) {
          const convexSubscription = await convex.query(
            api.subscriptions.getSubscriptionByStripeId,
            {
              stripeCustomerId: customerId,
            },
          );

          if (convexSubscription && convexSubscription.stripeSubscriptionId) {
            try {
              await convex.mutation(api.subscriptions.deleteSubscriptionByStripeId, {
                stripeSubscriptionId: convexSubscription.stripeSubscriptionId,
              });
              console.log('Subscription deleted due to refund:', {
                userId: convexSubscription.userId,
                subscriptionId: convexSubscription.stripeSubscriptionId,
              });
            } catch (error) {
              console.error('Error deleting subscription after refund:', error);
            }
          }
        }

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as unknown as { subscription: string | null }).subscription;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(
            subscriptionId,
          );
          const subscriptionEndsAt = (subscription as unknown as { current_period_end: number }).current_period_end * 1000;

          // Find subscription in Convex
          const convexSubscription = await convex.query(
            api.subscriptions.getSubscriptionByStripeId,
            {
              stripeSubscriptionId: subscriptionId,
            },
          );

          if (convexSubscription) {
            // Update subscription end date
            await convex.mutation(api.subscriptions.updateSubscription, {
              userId: convexSubscription.userId,
              updates: {
                subscriptionEndsAt,
                status: 'active', // Payment succeeded, ensure active
                plan: 'premium',
              },
            });
          }
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

