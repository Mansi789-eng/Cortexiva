-- ============================================
-- ADD TIER AND STRIPE COLUMNS TO PROFILES
-- Migration: 20250125_add_tier_columns
-- ============================================

-- Add tier column with default 'free'
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free'
CHECK (tier IN ('free', 'plus')) NOT NULL;

-- Add stripe_customer_id for future Stripe integration
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Create index for stripe lookups
CREATE INDEX IF NOT EXISTS profiles_stripe_customer_id_idx
ON public.profiles(stripe_customer_id)
WHERE stripe_customer_id IS NOT NULL;

-- Update the handle_new_user function to include tier
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, tier)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    'free'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
