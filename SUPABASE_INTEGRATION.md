# 🚀 Intégration Supabase Complete - MONITY

## 1️⃣ SETUP SUPABASE (5 minutes)

### Créer un projet Supabase
1. Allez sur https://supabase.com
2. Créez un nouveau projet
3. Notez vos credentials:
   - `SUPABASE_URL`: https://xxxxx.supabase.co
   - `SUPABASE_KEY`: eyJhbGc...

### Ajouter vos credentials au `.env.local`
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_KEY=eyJhbGc...
```

## 2️⃣ CRÉER LES TABLES SUPABASE

Dans Supabase SQL Editor, exécutez:

```sql
-- Users (géré par Supabase Auth automatiquement)
-- auth.users est créé automatiquement

-- Profils utilisateur
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Comptes
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(120) NOT NULL,
  type VARCHAR(20) DEFAULT 'personal',
  current_balance FLOAT DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'EUR',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Catégories
CREATE TABLE transaction_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#808080',
  icon VARCHAR(50),
  type VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Transactions
CREATE TABLE transactions (
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

-- Budgets
CREATE TABLE budgets (
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

-- Préférences utilisateur
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  theme VARCHAR(20) DEFAULT 'light',
  language VARCHAR(5) DEFAULT 'fr',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  currency_preferred VARCHAR(3) DEFAULT 'EUR',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) - Très important!
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Policies: Les utilisateurs ne voient que leurs propres données
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own accounts" ON accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accounts" ON accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own budgets" ON budgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets" ON budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own categories" ON transaction_categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON transaction_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);
```

## 3️⃣ METTRE À JOUR LE FRONTEND

Mettez à jour `frontend/src/config/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

## 4️⃣ CRÉER DES SERVICES SUPABASE

Créez `frontend/src/services/supabaseService.js`:

```javascript
import { supabase } from '../config/supabase'

// Comptes
export async function getAccounts() {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function createAccount(accountData) {
  const { data, error } = await supabase
    .from('accounts')
    .insert([accountData])
    .select()
  
  if (error) throw error
  return data[0]
}

// Transactions
export async function getTransactions(accountId) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, categories:category_id(*)')
    .eq('account_id', accountId)
    .order('date', { ascending: false })
  
  if (error) throw error
  return data
}

export async function createTransaction(transactionData) {
  const { data, error } = await supabase
    .from('transactions')
    .insert([transactionData])
    .select()
  
  if (error) throw error
  return data[0]
}

// Budgets
export async function getBudgets(accountId) {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('account_id', accountId)
    .eq('is_active', true)
  
  if (error) throw error
  return data
}

// Préférences
export async function getUserPreferences() {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function updateUserPreferences(prefs) {
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert([prefs])
    .select()
  
  if (error) throw error
  return data[0]
}
```

## 5️⃣ AVANTAGES / INCONVÉNIENTS

### ✅ Supabase Seul
- ✅ Une BD unique
- ✅ Auth complète (OAuth, Email, MFA)
- ✅ RLS intégrée
- ✅ Temps réel
- ✅ Pas de backend à gérer
- ❌ Dépendance cloud externe

### ❌ Supabase + Backend Flask
- ✅ Total contrôle
- ❌ 2 systèmes à maintenir
- ❌ Plus complexe
- ❌ Coûts plus élevés

## 🎯 RECOMMANDATION: **Supabase Seul = Meilleur**

Simplifiez votre stack. C'est ce que font les startups modernes!