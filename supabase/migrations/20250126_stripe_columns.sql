-- ============================================
-- ADD STRIPE PAYMENT COLUMNS TO PROFILES
-- Migration: 20250126_stripe_columns
-- ============================================

-- Add starter_paid column (has user paid €1 gate?)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS starter_paid BOOLEAN DEFAULT false NOT NULL;

-- Add stripe_subscription_id for Plus subscriptions
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Add plus_bots count (number of bots in Plus subscription)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS plus_bots INTEGER DEFAULT 0 NOT NULL;

-- Add plus_seats count (number of seats in Plus subscription)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS plus_seats INTEGER DEFAULT 0 NOT NULL;

-- Create index for subscription lookups
CREATE INDEX IF NOT EXISTS profiles_stripe_subscription_id_idx
ON public.profiles(stripe_subscription_id)
WHERE stripe_subscription_id IS NOT NULL;

-- Update the handle_new_user function to include new columns
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, tier, starter_paid, plus_bots, plus_seats)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    'free',
    false,
    0,
    0
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
