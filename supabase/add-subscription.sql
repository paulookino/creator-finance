-- Adicionar campos de assinatura ao profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'free'
  CHECK (subscription_status IN ('free', 'trialing', 'active', 'past_due', 'canceled'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_plan text CHECK (subscription_plan IN ('monthly', 'annual'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_ends_at timestamptz;

-- Índice para lookup pelo stripe customer id
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON profiles(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
