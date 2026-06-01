-- ============================================================
-- CreatorFinance — Schema completo
-- Rodar no SQL Editor do Supabase
-- ============================================================

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  tax_regime text DEFAULT 'simples' CHECK (tax_regime IN ('mei','simples','presumido','real')),
  simples_rate decimal DEFAULT 0.06,
  mei_das decimal DEFAULT 75.90,
  created_at timestamptz DEFAULT now()
);

-- INTEGRATIONS
CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('hotmart','kiwify','adsense','manual')),
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  last_sync_at timestamptz,
  is_active boolean DEFAULT true,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- TRANSACTIONS
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform text NOT NULL,
  external_id text,
  product_name text,
  product_external_id text,
  amount decimal NOT NULL,
  platform_fee decimal DEFAULT 0,
  net_amount decimal,
  type text DEFAULT 'sale' CHECK (type IN ('sale','refund','subscription','affiliate','adsense','brand_deal')),
  status text DEFAULT 'approved' CHECK (status IN ('approved','pending','refunded','cancelled')),
  transaction_date timestamptz NOT NULL,
  paid_at timestamptz,
  buyer_email text,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(platform, external_id, user_id)
);

-- PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform text NOT NULL,
  external_id text,
  name text NOT NULL,
  price decimal,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- PAYMENT_SCHEDULE
CREATE TABLE IF NOT EXISTS payment_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform text NOT NULL,
  expected_date date NOT NULL,
  amount decimal NOT NULL,
  period_start date,
  period_end date,
  status text DEFAULT 'pending' CHECK (status IN ('pending','received','delayed')),
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- RLS — Row Level Security
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "own_integrations" ON integrations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_transactions" ON transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_products" ON products FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_schedule" ON payment_schedule FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGER — cria perfil automaticamente ao signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- ÍNDICES — performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_platform ON transactions(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_products_user ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_schedule_user_date ON payment_schedule(user_id, expected_date);
