import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOrCreateCustomer, createStarterCheckout } from '@/lib/stripe';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// POST /api/stripe/checkout-starter - Create checkout session for €1 starter payment
export async function POST() {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name, starter_paid, stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check if already paid
    if (profile.starter_paid) {
      return NextResponse.json({ error: 'Already paid' }, { status: 400 });
    }

    // Get or create Stripe customer
    let customerId = profile.stripe_customer_id;
    if (!customerId) {
      customerId = await getOrCreateCustomer(user.id, profile.email, profile.full_name);

      // Save customer ID to profile
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Create checkout session
    const session = await createStarterCheckout(
      customerId,
      `${APP_URL}/payment-success?type=starter`,
      `${APP_URL}/pricing-page`
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[Stripe] Checkout starter error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
