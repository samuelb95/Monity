-- ==========================================================
-- MONITY - PERSISTENCE DES CONFIGURATIONS PLAN / PROJECTION
-- ==========================================================

CREATE TABLE IF NOT EXISTS financial_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  allocation_targets JSONB DEFAULT '[]'::jsonb,
  planner_view TEXT DEFAULT 'balanced',
  forecast_goal_id UUID NULL REFERENCES savings_goals(id) ON DELETE SET NULL,
  forecast_monthly_contribution NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_financial_profiles_user_id
  ON financial_profiles(user_id);

ALTER TABLE financial_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own financial profile" ON financial_profiles;
CREATE POLICY "Users can view own financial profile" ON financial_profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own financial profile" ON financial_profiles;
CREATE POLICY "Users can insert own financial profile" ON financial_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own financial profile" ON financial_profiles;
CREATE POLICY "Users can update own financial profile" ON financial_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_financial_profiles_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_financial_profiles_updated_at ON financial_profiles;
CREATE TRIGGER trg_financial_profiles_updated_at
BEFORE UPDATE ON financial_profiles
FOR EACH ROW
EXECUTE FUNCTION update_financial_profiles_timestamp();
