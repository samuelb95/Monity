-- ============================================
-- PHASE 2 COMPLETE : Ajout date de fin pour récurrences
-- ============================================

-- Ajouter la colonne recurrence_end_date si elle n'existe pas déjà
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS recurrence_end_date DATE;

-- Commentaire
COMMENT ON COLUMN transactions.recurrence_end_date IS 'Date de fin pour les transactions récurrentes (NULL = indéfini)';

-- Fonction améliorée pour générer les occurrences avec date de fin
CREATE OR REPLACE FUNCTION generate_transaction_occurrences(
  transaction_id_param UUID,
  start_month INT,
  start_year INT,
  end_month INT,
  end_year INT
)
RETURNS TABLE (
  occurrence_date DATE,
  amount FLOAT,
  is_validated BOOLEAN
) AS $$
DECLARE
  trans_record RECORD;
  current_date DATE;
  period_start DATE;
  period_end DATE;
BEGIN
  -- Récupérer la transaction
  SELECT * INTO trans_record FROM transactions WHERE id = transaction_id_param;
  
  IF NOT FOUND OR NOT trans_record.is_recurring THEN
    RETURN;
  END IF;
  
  -- Définir la période
  period_start := make_date(start_year, start_month, 1);
  period_end := (make_date(end_year, end_month, 1) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
  
  -- Générer les occurrences
  current_date := trans_record.date::DATE;
  
  WHILE current_date <= period_end LOOP
    -- Vérifier si dans la période et avant la date de fin de récurrence
    IF current_date >= period_start 
       AND (trans_record.recurrence_end_date IS NULL OR current_date <= trans_record.recurrence_end_date) THEN
      
      -- Vérifier s'il y a une occurrence modifiée/sautée
      SELECT 
        CASE 
          WHEN o.is_skipped THEN NULL
          ELSE COALESCE(o.modified_amount, trans_record.amount)
        END,
        COALESCE(o.is_validated, FALSE)
      INTO amount, is_validated
      FROM transaction_occurrences o
      WHERE o.transaction_id = transaction_id_param 
        AND o.occurrence_date = current_date;
      
      -- Si pas sautée, retourner l'occurrence
      IF amount IS NOT NULL THEN
        occurrence_date := current_date;
        RETURN NEXT;
      END IF;
    END IF;
    
    -- Passer à la prochaine occurrence
    current_date := generate_recurrence_date(current_date, trans_record.recurrence_pattern, 1);
    
    -- Sortir si dépassé la date de fin de récurrence
    IF trans_record.recurrence_end_date IS NOT NULL 
       AND current_date > trans_record.recurrence_end_date THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Ajouter une colonne is_validated dans transaction_occurrences
ALTER TABLE transaction_occurrences
ADD COLUMN IF NOT EXISTS is_validated BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN transaction_occurrences.is_validated IS 'Indique si cette occurrence a été validée';