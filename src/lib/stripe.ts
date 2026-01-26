import Stripe from 'stripe';

// ============================================
// Stripe Client Configuration
// ============================================

// Lazy initialization to avoid errors during build time
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    _stripe = new Stripe(secretKey, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    });
  }
  return _stripe;
}

// For backwards compatibility
export const stripe = {
  get customers() { return getStripe().customers; },
  get checkout() { return getStripe().checkout; },
  get billingPortal() { return getStripe().billingPortal; },
  get subscriptions() { return getStripe().subscriptions; },
  get webhooks() { return getStripe().webhooks; },
};

// ============================================
// Price IDs (Set these in .env after creating in Stripe Dashboard)
// ============================================

export const STRIPE_PRICES = {
  starter: process.env.STRIPE_STARTER_PRICE_ID || '',  // €1 one-time
  bot: process.env.STRIPE_BOT_PRICE_ID || '',          // €5/month per bot
  seat: process.env.STRIPE_SEAT_PRICE_ID || '',        // €2/month per seat
};

// ============================================
// Helper Functions
// ============================================

/**
 * Create or retrieve a Stripe customer for a user
 */
export async function getOrCreateCustomer(
  userId: string,
  email: string,
  name?: string | null
): Promise<string> {
  const stripeClient = getStripe();

  // Search for existing customer by metadata
  const existingCustomers = await stripeClient.customers.list({
    email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0].id;
  }

  // Create new customer
  const customer = await stripeClient.customers.create({
    email,
    name: name || undefined,
    metadata: {
      supabase_user_id: userId,
    },
  });

  return customer.id;
}

/**
 * Create a checkout session for the €1 Starter payment
 */
export async function createStarterCheckout(
  customerId: string,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  const stripeClient = getStripe();

  return stripeClient.checkout.sessions.create({
    customer: customerId,
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price: STRIPE_PRICES.starter,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      type: 'starter',
    },
  });
}

/**
 * Create a checkout session for Plus subscription
 */
export async function createPlusCheckout(
  customerId: string,
  botCount: number,
  seatCount: number,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  const stripeClient = getStripe();

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  if (botCount > 0) {
    lineItems.push({
      price: STRIPE_PRICES.bot,
      quantity: botCount,
    });
  }

  if (seatCount > 0) {
    lineItems.push({
      price: STRIPE_PRICES.seat,
      quantity: seatCount,
    });
  }

  return stripeClient.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      type: 'plus',
      bot_count: botCount.toString(),
      seat_count: seatCount.toString(),
    },
  });
}

/**
 * Create a customer portal session for managing subscriptions
 */
export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  const stripeClient = getStripe();

  return stripeClient.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

/**
 * Get subscription details
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  try {
    const stripeClient = getStripe();
    return await stripeClient.subscriptions.retrieve(subscriptionId);
  } catch {
    return null;
  }
}

/**
 * Update subscription quantities (for adding/removing bots/seats)
 */
export async function updateSubscriptionQuantities(
  subscriptionId: string,
  botCount: number,
  seatCount: number
): Promise<Stripe.Subscription> {
  const stripeClient = getStripe();
  const subscription = await stripeClient.subscriptions.retrieve(subscriptionId);

  const items: Stripe.SubscriptionUpdateParams.Item[] = [];

  for (const item of subscription.items.data) {
    if (item.price.id === STRIPE_PRICES.bot) {
      items.push({ id: item.id, quantity: botCount });
    } else if (item.price.id === STRIPE_PRICES.seat) {
      items.push({ id: item.id, quantity: seatCount });
    }
  }

  return stripeClient.subscriptions.update(subscriptionId, { items });
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const stripeClient = getStripe();
  return stripeClient.subscriptions.cancel(subscriptionId);
}
