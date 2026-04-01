-- ============================================================
-- MIGRATION: Enveloppes budgétaires + sous-catégories
-- ============================================================

-- 1. Ajouter parent_id à transaction_categories pour les sous-catégories
ALTER TABLE transaction_categories 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES transaction_categories(id) ON DELETE SET NULL;

-- Index pour les recherches par parent
CREATE INDEX IF NOT EXISTS idx_transaction_categories_parent_id 
ON transaction_categories(parent_id);

-- 2. Ajouter limit_type aux budgets (montant fixe ou pourcentage des revenus)
ALTER TABLE budgets 
ADD COLUMN IF NOT EXISTS limit_type VARCHAR(10) DEFAULT 'amount' 
CHECK (limit_type IN ('amount', 'percentage'));

-- 3. Insérer des catégories par défaut avec hiérarchie (pour nouveaux utilisateurs)
-- Note: Ces catégories seront créées par le frontend lors du premier login

-- ============================================================
-- Exemple de structure hiérarchique:
-- 
-- 🏠 Logement (parent)
--   └── 🔧 Charges
--   └── 🌡️ Énergie
--   └── 🛋️ Ameublement
--
-- 🎮 Loisirs (parent)
--   └── 🎬 Sorties
--   └── 🎵 Abonnements
--   └── 🏋️ Sport
--
-- 🛒 Alimentation (parent)
--   └── 🏪 Courses
--   └── 🍽️ Restaurants
--
-- 🚗 Transport (parent)
--   └── ⛽ Carburant
--   └── 🚌 Transports en commun
--   └── 🅿️ Stationnement
--
-- 💊 Santé (parent)
--   └── 👨‍⚕️ Médecin
--   └── 💊 Pharmacie
-- ============================================================