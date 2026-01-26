import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getStripe, STRIPE_PRICES } from '@/lib/stripe';
import { createServiceClient } from '@/lib/supabase/service';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// POST /api/stripe/webhook - Handle Stripe webhook events
export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      const stripeClient = getStripe();
      event = stripeClient.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('[Stripe Webhook] Signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const supabase = createServiceClient();

    console.log(`[Stripe Webhook] Event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      // ==========================================
      // STARTER PAYMENT (€1 one-time)
      // ==========================================
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.metadata?.type === 'starter') {
          // Find user by customer ID
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', session.customer)
            .single();

          if (profile) {
            await supabase
              .from('profiles')
              .update({ starter_paid: true })
              .eq('id', profile.id);

            console.log(`[Stripe Webhook] Starter payment completed for user ${profile.id}`);
          }
        } else if (session.metadata?.type === 'plus') {
          // Plus subscription started - handled by subscription.created
          console.log('[Stripe Webhook] Plus checkout completed, waiting for subscription.created');
        }
        break;
      }

      // ==========================================
      // PLUS SUBSCRIPTION CREATED
      // ==========================================
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        // Find user by customer ID
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', subscription.customer)
          .single();

        if (profile && subscription.status === 'active') {
          // Count bots and seats from subscription items
          let botCount = 0;
          let seatCount = 0;

          for (const item of subscription.items.data) {
            if (item.price.id === STRIPE_PRICES.bot) {
              botCount = item.quantity || 0;
            } else if (item.price.id === STRIPE_PRICES.seat) {
              seatCount = item.quantity || 0;
            }
          }

          await supabase
            .from('profiles')
            .update({
              tier: 'plus',
              stripe_subscription_id: subscription.id,
              plus_bots: botCount,
              plus_seats: seatCount,
            })
            .eq('id', profile.id);

          console.log(`[Stripe Webhook] Plus subscription active for user ${profile.id}: ${botCount} bots, ${seatCount} seats`);
        }
        break;
      }

      // ==========================================
      // PLUS SUBSCRIPTION CANCELLED/EXPIRED
      // ==========================================
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        // Find user by subscription ID
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (profile) {
          await supabase
            .from('profiles')
            .update({
              tier: 'free',
              stripe_subscription_id: null,
              plus_bots: 0,
              plus_seats: 0,
            })
            .eq('id', profile.id);

          console.log(`[Stripe Webhook] Subscription cancelled for user ${profile.id}, reverted to free tier`);
        }
        break;
      }

      // ==========================================
      // PAYMENT FAILED
      // ==========================================
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`[Stripe Webhook] Payment failed for customer ${invoice.customer}`);
        // Could send email notification here
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

