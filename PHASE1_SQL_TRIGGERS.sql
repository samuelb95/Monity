-- ============================================
-- PHASE 1 : MISE À JOUR AUTOMATIQUE DU SOLDE
-- ============================================
-- Ce script crée un trigger qui met à jour automatiquement
-- le solde du compte quand une transaction est ajoutée, modifiée ou supprimée

-- 1. Créer la fonction de mise à jour du solde
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    -- Ajouter au solde si revenu, soustraire si dépense
    UPDATE accounts 
    SET current_balance = current_balance + 
      CASE 
        WHEN NEW.type = 'income' THEN NEW.amount
        ELSE -NEW.amount
      END,
      updated_at = NOW()
    WHERE id = NEW.account_id;
    
  ELSIF (TG_OP = 'UPDATE') THEN
    -- Annuler l'ancienne transaction
    UPDATE accounts 
    SET current_balance = current_balance - 
      CASE 
        WHEN OLD.type = 'income' THEN OLD.amount
        ELSE -OLD.amount
      END
    WHERE id = OLD.account_id;
    
    -- Appliquer la nouvelle transaction
    UPDATE accounts 
    SET current_balance = current_balance + 
      CASE 
        WHEN NEW.type = 'income' THEN NEW.amount
        ELSE -NEW.amount
      END,
      updated_at = NOW()
    WHERE id = NEW.account_id;
    
  ELSIF (TG_OP = 'DELETE') THEN
    -- Annuler la transaction supprimée
    UPDATE accounts 
    SET current_balance = current_balance - 
      CASE 
        WHEN OLD.type = 'income' THEN OLD.amount
        ELSE -OLD.amount
      END,
      updated_at = NOW()
    WHERE id = OLD.account_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS update_balance_on_transaction ON transactions;

-- 3. Créer le trigger
CREATE TRIGGER update_balance_on_transaction
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_account_balance();

-- 4. Fonction pour recalculer le solde d'un compte (utile pour corrections)
CREATE OR REPLACE FUNCTION recalculate_account_balance(account_uuid UUID)
RETURNS void AS $$
DECLARE
  total_income FLOAT;
  total_expenses FLOAT;
  new_balance FLOAT;
BEGIN
  -- Calculer le total des revenus
  SELECT COALESCE(SUM(amount), 0) INTO total_income
  FROM transactions
  WHERE account_id = account_uuid AND type = 'income';
  
  -- Calculer le total des dépenses
  SELECT COALESCE(SUM(amount), 0) INTO total_expenses
  FROM transactions
  WHERE account_id = account_uuid AND type = 'expense';
  
  -- Calculer le nouveau solde
  new_balance := total_income - total_expenses;
  
  -- Mettre à jour le compte
  UPDATE accounts
  SET current_balance = new_balance,
      updated_at = NOW()
  WHERE id = account_uuid;
  
  RAISE NOTICE 'Solde recalculé pour le compte %: %€', account_uuid, new_balance;
END;
$$ LANGUAGE plpgsql;

-- Pour recalculer tous les comptes (exécuter si besoin de corriger les soldes):
-- SELECT recalculate_account_balance(id) FROM accounts;