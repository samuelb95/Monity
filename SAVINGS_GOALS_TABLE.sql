-- === SAVINGS GOALS TABLE ===
-- Table pour gérer les objectifs d'épargne
-- IMPORTANT: Exécutez ce script UNE SEULE FOIS

CREATE TABLE IF NOT EXISTS savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(120) NOT NULL,
  target_amount FLOAT NOT NULL,
  current_amount FLOAT DEFAULT 0,
  target_date TIMESTAMP,
  color VARCHAR(7) DEFAULT '#4CAF50',
  icon VARCHAR(50),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- === RLS FOR SAVINGS GOALS ===
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;

-- === POLICIES FOR SAVINGS GOALS ===
-- Supprimer les policies existantes si elles existent
DROP POLICY IF EXISTS "Users can view own savings goals" ON savings_goals;
DROP POLICY IF EXISTS "Users can insert own savings goals" ON savings_goals;
DROP POLICY IF EXISTS "Users can update own savings goals" ON savings_goals;
DROP POLICY IF EXISTS "Users can delete own savings goals" ON savings_goals;

-- Créer les nouvelles policies
CREATE POLICY "Users can view own savings goals" ON savings_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own savings goals" ON savings_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own savings goals" ON savings_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own savings goals" ON savings_goals FOR DELETE USING (auth.uid() = user_id);
