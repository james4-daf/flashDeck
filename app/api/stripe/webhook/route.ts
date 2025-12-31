// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { logDebug, logError, logInfo } from '@/lib/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Initialize Convex client for server-side calls
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Type helper for accessing Stripe properties that may vary across API versions
type StripeRecord = Record<string, unknown>;

/**
 * Get subscription end date from Stripe subscription object.
 * Handles multiple API versions where the field location may differ.
 * Returns timestamp in milliseconds.
 */
async function getSubscriptionEndDate(
  subscription: Stripe.Subscription,
  invoiceId?: string | null,
): Promise<number> {
  const subscriptionItem = subscription.items.data[0];
  const interval = subscriptionItem?.price.recurring?.interval;
  const intervalCount = subscriptionItem?.price.recurring?.interval_count || 1;
  
  // Method 1: Try current_period_end from subscription (standard location)
  const subscriptionRecord = subscription as unknown as StripeRecord;
  const currentPeriodEnd = subscriptionRecord.current_period_end;
  if (currentPeriodEnd && typeof currentPeriodEnd === 'number') {
    logDebug('Got subscriptionEndsAt from subscription.current_period_end');
    return currentPeriodEnd * 1000;
  }
  
  // Method 2: Try current_period_end from subscription item (newer API versions)
  if (subscriptionItem) {
    const itemRecord = subscriptionItem as unknown as StripeRecord;
    const itemPeriodEnd = itemRecord.current_period_end;
    if (itemPeriodEnd && typeof itemPeriodEnd === 'number') {
      logDebug('Got subscriptionEndsAt from subscription.items[0].current_period_end');
      return itemPeriodEnd * 1000;
    }
  }
  
  // Method 3: Calculate from billing_cycle_anchor + interval
  const billingCycleAnchor = subscriptionRecord.billing_cycle_anchor;
  if (billingCycleAnchor && typeof billingCycleAnchor === 'number' && interval) {
    const anchorDate = new Date(billingCycleAnchor * 1000);
    
    let endDate: Date;
    if (interval === 'year') {
      endDate = new Date(anchorDate);
      endDate.setFullYear(endDate.getFullYear() + intervalCount);
    } else if (interval === 'month') {
      endDate = new Date(anchorDate);
      endDate.setMonth(endDate.getMonth() + intervalCount);
    } else if (interval === 'week') {
      endDate = new Date(anchorDate);
      endDate.setDate(endDate.getDate() + (intervalCount * 7));
    } else if (interval === 'day') {
      endDate = new Date(anchorDate);
      endDate.setDate(endDate.getDate() + intervalCount);
    } else {
      endDate = new Date(anchorDate);
      // Default to 1 year if interval is unknown
      endDate.setFullYear(endDate.getFullYear() + 1);
    }
    
    logDebug('Got subscriptionEndsAt from billing_cycle_anchor + interval', {
      interval,
      intervalCount,
    });
    return endDate.getTime();
  }
  
  // Method 4: Try invoice lines period_end (most detailed)
  try {
    const latestInvoice = subscriptionRecord.latest_invoice;
    const invoiceToRetrieve = invoiceId || latestInvoice;
    if (invoiceToRetrieve) {
      const invoiceIdStr = typeof invoiceToRetrieve === 'string' 
        ? invoiceToRetrieve 
        : (invoiceToRetrieve as StripeRecord).id as string || String(invoiceToRetrieve);
      const invoice = await stripe.invoices.retrieve(invoiceIdStr, { expand: ['lines'] });
      
      // Try to get period_end from invoice lines (subscription items)
      const subscriptionLine = invoice.lines?.data?.find(
        (line) => (line as unknown as StripeRecord).type === 'subscription'
      );
      const lineRecord = subscriptionLine as unknown as StripeRecord | undefined;
      const linePeriod = lineRecord?.period as { end?: number } | undefined;
      const linePeriodEnd = linePeriod?.end;
      
      if (linePeriodEnd && typeof linePeriodEnd === 'number') {
        logDebug('Got subscriptionEndsAt from invoice.lines.period.end');
        return linePeriodEnd * 1000;
      }
      
      // Fallback to invoice period_end
      const invoiceRecord = invoice as unknown as StripeRecord;
      const invoicePeriodEnd = invoiceRecord.period_end;
      if (invoicePeriodEnd && typeof invoicePeriodEnd === 'number') {
        logDebug('Got subscriptionEndsAt from invoice.period_end');
        return invoicePeriodEnd * 1000;
      }
    }
  } catch (error) {
    logError('Error getting subscription period from invoice', error);
  }
  
  logError('Unable to determine subscription period end date', {
    subscriptionId: subscription.id,
  });
  throw new Error('Unable to determine subscription period end date');
}

export async function POST(request: NextRequest) {
  logDebug('Webhook received');
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  if (!webhookSecret) {
    logError('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    logDebug('Webhook signature verified', { eventType: event.type });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    logError('Webhook signature verification failed', err);
    return NextResponse.json(
      { error: `Webhook Error: ${errorMessage}` },
      { status: 400 },
    );
  }

  try {
    logDebug(`Processing webhook event: ${event.type}`);
    
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        logDebug('Checkout session completed', { sessionId: session.id });

        const userId = session.metadata?.userId || session.client_reference_id;

        if (!userId) {
          logError('No userId in checkout session');
          break;
        }

        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;
        const invoiceId = session.invoice as string;

        if (!subscriptionId) {
          logError('No subscription ID in checkout session');
          break;
        }

        logDebug('Retrieving subscription from Stripe');

        // Get subscription details from Stripe
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price.id;
        const billingCycle =
          subscription.items.data[0]?.price.recurring?.interval === 'year'
            ? 'annual'
            : 'monthly';

        // Get subscription end date using robust helper function
        const subscriptionEndsAt = await getSubscriptionEndDate(subscription, invoiceId);

        logDebug('Creating subscription in Convex', { billingCycle });

        // Create or update subscription in Convex
        try {
          await convex.mutation(api.subscriptions.createSubscription, {
            userId,
            plan: 'premium',
            status: 'active',
            billingCycle,
            subscriptionEndsAt,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            stripePriceId: priceId,
          });
          logInfo('Subscription created successfully', undefined, true);
        } catch (convexError) {
          logError('Error creating subscription in Convex', convexError);
          throw convexError;
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.id;

        logDebug('Subscription updated', { status: subscription.status });

        // Find subscription in Convex by Stripe subscription ID
        const convexSubscription = await convex.query(
          api.subscriptions.getSubscriptionByStripeId,
          {
            stripeSubscriptionId: subscriptionId,
          },
        );

        if (!convexSubscription) {
          logError('Subscription not found in Convex');
          break;
        }

        // If subscription is immediately cancelled (refund scenario), delete the record
        if (subscription.status === 'canceled' && !subscription.cancel_at_period_end) {
          logDebug('Subscription immediately cancelled (refund) - deleting record');
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
        
        // Get subscription end date using robust helper function
        let subscriptionEndsAt: number;
        try {
          subscriptionEndsAt = await getSubscriptionEndDate(subscription);
        } catch (error) {
          logError('Error getting subscription end date', error);
          break;
        }

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

        logDebug('Subscription updated in Convex', { status, plan });

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.id;

        logDebug('Subscription deleted');

        // Delete subscription record entirely (refund scenario - immediate access removal)
        try {
          await convex.mutation(api.subscriptions.deleteSubscriptionByStripeId, {
            stripeSubscriptionId: subscriptionId,
          });
          logInfo('Subscription deleted from Convex', undefined, true);
        } catch (error) {
          logError('Error deleting subscription', error);
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

        logDebug('Charge refunded');

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
              logInfo('Subscription deleted due to refund', undefined, true);
            } catch (error) {
              logError('Error deleting subscription after refund', error);
            }
          }
        }

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as unknown as { subscription: string | null }).subscription;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          
          // Get subscription end date using robust helper function
          let subscriptionEndsAt: number;
          try {
            subscriptionEndsAt = await getSubscriptionEndDate(subscription, invoice.id);
          } catch (error) {
            logError('Error getting subscription end date in invoice.payment_succeeded', error);
            break;
          }

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
        // Log payment failure (important for monitoring)
        logInfo('Payment failed for invoice', { invoiceId: invoice.id }, true);
        break;
      }

      default:
        logDebug(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logError('Error processing webhook', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 },
    );
  }
}
