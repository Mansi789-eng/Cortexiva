import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOrCreateCustomer, createPlusCheckout } from '@/lib/stripe';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// POST /api/stripe/checkout-plus - Create checkout session for Plus subscription
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const { botCount = 1, seatCount = 1 } = await request.json();

    // Validate quantities
    if (botCount < 1 || seatCount < 1) {
      return NextResponse.json(
        { error: 'Must have at least 1 bot and 1 seat' },
        { status: 400 }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name, starter_paid, stripe_customer_id, tier')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Must have paid starter first
    if (!profile.starter_paid) {
      return NextResponse.json(
        { error: 'Must complete starter payment first' },
        { status: 400 }
      );
    }

    // Already on Plus?
    if (profile.tier === 'plus') {
      return NextResponse.json(
        { error: 'Already on Plus plan. Use customer portal to manage subscription.' },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    let customerId = profile.stripe_customer_id;
    if (!customerId) {
      customerId = await getOrCreateCustomer(user.id, profile.email, profile.full_name);

      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Create checkout session
    const session = await createPlusCheckout(
      customerId,
      botCount,
      seatCount,
      `${APP_URL}/payment-success?type=plus`,
      `${APP_URL}/pricing-page`
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[Stripe] Checkout plus error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
