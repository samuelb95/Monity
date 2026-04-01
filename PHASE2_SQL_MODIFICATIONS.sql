-- ============================================
-- PHASE 2 : MODIFICATIONS BASE DE DONNÉES
-- ============================================
-- Validation des transactions, édition et suppression

-- 1. Ajouter colonnes pour la validation des transactions
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS is_validated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS validated_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS validated_by UUID REFERENCES auth.users(id);

-- 2. Créer index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_transactions_validated ON transactions(is_validated);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- 3. Table pour les occurrences de transactions récurrentes
CREATE TABLE IF NOT EXISTS transaction_occurrences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE NOT NULL,
  occurrence_date DATE NOT NULL,
  amount FLOAT NOT NULL,
  is_skipped BOOLEAN DEFAULT FALSE,
  is_modified BOOLEAN DEFAULT FALSE,
  modified_amount FLOAT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(transaction_id, occurrence_date)
);

-- RLS pour transaction_occurrences
ALTER TABLE transaction_occurrences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own occurrences" ON transaction_occurrences;
CREATE POLICY "Users can view own occurrences" ON transaction_occurrences
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM transactions t 
    WHERE t.id = transaction_occurrences.transaction_id 
    AND t.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can manage own occurrences" ON transaction_occurrences;
CREATE POLICY "Users can manage own occurrences" ON transaction_occurrences
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM transactions t 
    WHERE t.id = transaction_occurrences.transaction_id 
    AND t.user_id = auth.uid()
  )
);

-- 4. Index pour transaction_occurrences
CREATE INDEX IF NOT EXISTS idx_occurrences_transaction ON transaction_occurrences(transaction_id);
CREATE INDEX IF NOT EXISTS idx_occurrences_date ON transaction_occurrences(occurrence_date);

-- 5. Fonction pour générer les occurrences d'une transaction récurrente
CREATE OR REPLACE FUNCTION generate_recurrence_date(
  start_date DATE,
  pattern VARCHAR,
  occurrence_number INT
)
RETURNS DATE AS $$
BEGIN
  CASE pattern
    WHEN 'daily' THEN
      RETURN start_date + (occurrence_number * INTERVAL '1 day');
    WHEN 'weekly' THEN
      RETURN start_date + (occurrence_number * INTERVAL '1 week');
    WHEN 'bi-weekly' THEN
      RETURN start_date + (occurrence_number * INTERVAL '2 weeks');
    WHEN 'monthly' THEN
      RETURN start_date + (occurrence_number * INTERVAL '1 month');
    WHEN 'quarterly' THEN
      RETURN start_date + (occurrence_number * INTERVAL '3 months');
    WHEN 'semi-annually' THEN
      RETURN start_date + (occurrence_number * INTERVAL '6 months');
    WHEN 'yearly' THEN
      RETURN start_date + (occurrence_number * INTERVAL '1 year');
    ELSE
      RETURN start_date;
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 6. Vue pour afficher les transactions avec leurs occurrences
CREATE OR REPLACE VIEW transactions_with_occurrences AS
SELECT 
  t.*,
  COALESCE(
    (SELECT json_agg(
      json_build_object(
        'id', o.id,
        'occurrence_date', o.occurrence_date,
        'amount', COALESCE(o.modified_amount, o.amount),
        'is_skipped', o.is_skipped,
        'is_modified', o.is_modified,
        'notes', o.notes
      )
    )
    FROM transaction_occurrences o
    WHERE o.transaction_id = t.id
    ), '[]'::json
  ) as occurrences
FROM transactions t;

-- Commentaire sur l'utilisation
COMMENT ON TABLE transaction_occurrences IS 'Stocke les modifications spécifiques des occurrences de transactions récurrentes';
COMMENT ON COLUMN transactions.is_validated IS 'Indique si la transaction a été validée/confirmée';
COMMENT ON COLUMN transactions.validated_at IS 'Date et heure de validation';
COMMENT ON COLUMN transactions.validated_by IS 'Utilisateur qui a validé la transaction';