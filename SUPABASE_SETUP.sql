-- ============================================
-- MONITY - SUPABASE DATABASE SETUP
-- Exécutez ce script dans Supabase SQL Editor
-- ============================================

-- 1. PROFILS (extension de auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. COMPTES BANCAIRES
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(120) NOT NULL,
  type VARCHAR(20) DEFAULT 'personal',
  current_balance FLOAT DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'EUR',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. CATÉGORIES
CREATE TABLE IF NOT EXISTS transaction_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#808080',
  icon VARCHAR(50),
  type VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- 4. TRANSACTIONS
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES transaction_categories(id) ON DELETE SET NULL,
  amount FLOAT NOT NULL,
  type VARCHAR(20) NOT NULL,
  description VARCHAR(255),
  date TIMESTAMP DEFAULT NOW(),
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. BUDGETS
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES transaction_categories(id) ON DELETE SET NULL,
  name VARCHAR(120) NOT NULL,
  limit_amount FLOAT NOT NULL,
  period VARCHAR(20) DEFAULT 'monthly',
  start_date TIMESTAMP DEFAULT NOW(),
  end_date TIMESTAMP,
  alert_threshold FLOAT DEFAULT 80,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. PRÉFÉRENCES UTILISATEUR
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  theme VARCHAR(20) DEFAULT 'light',
  language VARCHAR(5) DEFAULT 'fr',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  currency_preferred VARCHAR(3) DEFAULT 'EUR',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- PROFILES - Chacun voit son profil
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ACCOUNTS - Chacun voit ses comptes
CREATE POLICY "Users can view own accounts" ON accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accounts" ON accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts" ON accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts" ON accounts
  FOR DELETE USING (auth.uid() = user_id);

-- TRANSACTIONS - Chacun voit ses transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- CATEGORIES - Chacun voit ses catégories
CREATE POLICY "Users can view own categories" ON transaction_categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON transaction_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON transaction_categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON transaction_categories
  FOR DELETE USING (auth.uid() = user_id);

-- BUDGETS - Chacun voit ses budgets
CREATE POLICY "Users can view own budgets" ON budgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets" ON budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets" ON budgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets" ON budgets
  FOR DELETE USING (auth.uid() = user_id);

-- PREFERENCES - Chacun voit ses préférences
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- DONNÉES DE TEST (OPTIONNEL)
-- ============================================

-- Insérer une catégorie par défaut pour chaque utilisateur
-- (À faire manuellement après première connexion)