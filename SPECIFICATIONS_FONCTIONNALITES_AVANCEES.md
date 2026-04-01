# Spécifications des Fonctionnalités Avancées - Monity

Ce document détaille toutes les fonctionnalités avancées à implémenter pour le système de gestion de transactions et objectifs d'épargne.

---

## 📋 Table des matières

1. [Phase 1 : Améliorations de base](#phase-1--améliorations-de-base)
2. [Phase 2 : Gestion avancée des transactions](#phase-2--gestion-avancée-des-transactions)
3. [Phase 3 : Intégration objectifs](#phase-3--intégration-objectifs)
4. [Modifications base de données](#modifications-base-de-données)

---

## Phase 1 : Améliorations de base

### 1.1 Mise à jour automatique du solde du compte

**Problème actuel :** Le solde du compte ne se met pas à jour automatiquement après l'ajout d'une transaction.

**Solution proposée :**

#### A. Mise à jour via déclencheur SQL (Recommandé)
```sql
-- Créer une fonction pour mettre à jour le solde
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

-- Créer le déclencheur
CREATE TRIGGER update_balance_on_transaction
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_account_balance();
```

#### B. Alternative : Recalculer côté application
Si les déclencheurs n'est pas souhaité, recalculer à chaque chargement :
```javascript
// Dans supabaseService.js
export async function recalculateAccountBalance(accountId) {
  const transactions = await getTransactions(accountId);
  
  const balance = transactions.reduce((sum, t) => {
    return sum + (t.type === 'income' ? t.amount : -t.amount);
  }, 0);
  
  await supabase
    .from('accounts')
    .update({ current_balance: balance })
    .eq('id', accountId);
}
```

---

### 1.2 Navigation par mois avec sélecteur

**Fonctionnalité :** Naviguer entre les mois pour filtrer les transactions.

**Implémentation :**

#### A. Composant MonthNavigator
```jsx
// frontend/src/components/Common/MonthNavigator.jsx
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

export default function MonthNavigator({ currentDate, onDateChange }) {
  const [showPicker, setShowPicker] = useState(false);
  
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  
  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onDateChange(newDate);
  };
  
  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onDateChange(newDate);
  };
  
  const selectMonth = (monthIndex) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(monthIndex);
    onDateChange(newDate);
    setShowPicker(false);
  };
  
  return (
    <div className="flex items-center gap-4 bg-white rounded-lg p-4 shadow">
      <button onClick={goToPreviousMonth} className="p-2 hover:bg-gray-100 rounded">
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <button 
        onClick={() => setShowPicker(!showPicker)}
        className="flex items-center gap-2 px-4 py-2 font-semibold hover:bg-gray-100 rounded"
      >
        <Calendar className="w-5 h-5" />
        {months[currentDate.getMonth()]} {currentDate.getFullYear()}
      </button>
      
      <button onClick={goToNextMonth} className="p-2 hover:bg-gray-100 rounded">
        <ChevronRight className="w-5 h-5" />
      </button>
      
      {showPicker && (
        <div className="absolute mt-2 bg-white shadow-lg rounded-lg p-4 z-50">
          <div className="grid grid-cols-3 gap-2">
            {months.map((month, index) => (
              <button
                key={month}
                onClick={() => selectMonth(index)}
                className={`p-2 rounded hover:bg-blue-100 ${
                  index === currentDate.getMonth() ? 'bg-blue-500 text-white' : ''
                }`}
              >
                {month.substring(0, 3)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

#### B. Intégration dans DashboardPage
```javascript
const [selectedDate, setSelectedDate] = useState(new Date());

// Filtrer les transactions par mois
const filteredTransactions = transactions.filter(t => {
  const transactionDate = new Date(t.date);
  return transactionDate.getMonth() === selectedDate.getMonth() &&
         transactionDate.getFullYear() === selectedDate.getFullYear();
});
```

---

### 1.3 Section transactions avec "Voir plus"

**Fonctionnalité :** Afficher 3 transactions par défaut, avec bouton pour voir toutes.

**Implémentation :**

```jsx
const [showAllTransactions, setShowAllTransactions] = useState(false);

const displayedTransactions = showAllTransactions 
  ? filteredTransactions 
  : filteredTransactions.slice(0, 3);

// Dans le rendu
<div className="space-y-3">
  {displayedTransactions.map(transaction => (
    // Affichage transaction
  ))}
</div>

{filteredTransactions.length > 3 && (
  <button
    onClick={() => setShowAllTransactions(!showAllTransactions)}
    className="w-full mt-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
  >
    {showAllTransactions 
      ? 'Voir moins' 
      : `Voir plus (${filteredTransactions.length - 3} autres)`
    }
  </button>
)}
```

---

## Phase 2 : Gestion avancée des transactions

### 2.1 Validation des transactions

**Besoin :** Marquer les transactions comme validées/confirmées.

#### A. Modification base de données
```sql
ALTER TABLE transactions 
ADD COLUMN is_validated BOOLEAN DEFAULT FALSE,
ADD COLUMN validated_at TIMESTAMP,
ADD COLUMN validated_by UUID REFERENCES auth.users(id);
```

#### B. Service de validation
```javascript
export async function validateTransaction(transactionId) {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('transactions')
    .update({
      is_validated: true,
      validated_at: new Date().toISOString(),
      validated_by: user.id
    })
    .eq('id', transactionId)
    .select();
    
  if (error) throw error;
  return data[0];
}
```

---

### 2.2 Édition et suppression de transactions

**Fonctionnalité :** Modifier ou supprimer une transaction existante.

#### A. Modal d'édition
```jsx
// frontend/src/components/Transactions/EditTransactionModal.jsx
export default function EditTransactionModal({ 
  isOpen, 
  onClose, 
  transaction, 
  onTransactionUpdated 
}) {
  const [formData, setFormData] = useState({
    amount: transaction?.amount || '',
    type: transaction?.type || 'expense',
    description: transaction?.description || '',
    // ... autres champs
  });
  
  const handleUpdate = async (e) => {
    e.preventDefault();
    await updateTransaction(transaction.id, formData);
    onTransactionUpdated();
  };
  
  const handleDelete = async () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette transaction ?')) {
      await deleteTransaction(transaction.id);
      onTransactionUpdated();
      onClose();
    }
  };
  
  // ... render avec formulaire
}
```

#### B. Service mis à jour
```javascript
export async function updateTransaction(transactionId, updates) {
  const { data, error } = await supabase
    .from('transactions')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', transactionId)
    .select();
    
  if (error) throw error;
  return data[0];
}
```

---

### 2.3 Gestion des transactions récurrentes

**Fonctionnalité complexe :** Gérer les occurrences de transactions récurrentes.

#### A. Nouvelle table pour les occurrences
```sql
CREATE TABLE transaction_occurrences (
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
```

#### B. Génération des occurrences
```javascript
export async function generateRecurringOccurrences(transactionId, startDate, endDate) {
  const transaction = await getTransaction(transactionId);
  
  if (!transaction.is_recurring) return [];
  
  const occurrences = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    occurrences.push({
      transaction_id: transactionId,
      occurrence_date: currentDate.toISOString().split('T')[0],
      amount: transaction.amount
    });
    
    // Calculer la prochaine date selon le pattern
    switch (transaction.recurrence_pattern) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + 1);
        break;
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
      case 'quarterly':
        currentDate.setMonth(currentDate.getMonth() + 3);
        break;
      case 'yearly':
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        break;
    }
  }
  
  return occurrences;
}
```

#### C. Modification d'une occurrence spécifique
```javascript
export async function modifyOccurrence(transactionId, occurrenceDate, updates) {
  const { data, error } = await supabase
    .from('transaction_occurrences')
    .upsert({
      transaction_id: transactionId,
      occurrence_date: occurrenceDate,
      is_modified: true,
      modified_amount: updates.amount,
      notes: updates.notes
    })
    .select();
    
  if (error) throw error;
  return data[0];
}

export async function skipOccurrence(transactionId, occurrenceDate) {
  const { data, error } = await supabase
    .from('transaction_occurrences')
    .upsert({
      transaction_id: transactionId,
      occurrence_date: occurrenceDate,
      is_skipped: true
    })
    .select();
    
  if (error) throw error;
  return data[0];
}
```

#### D. Affichage des occurrences avec modifications
```javascript
export async function getTransactionsWithOccurrences(accountId, month, year) {
  const transactions = await getTransactions(accountId);
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  
  const result = [];
  
  for (const transaction of transactions) {
    if (transaction.is_recurring) {
      const occurrences = await generateRecurringOccurrences(
        transaction.id,
        startDate,
        endDate
      );
      
      // Récupérer les modifications/sauts
      const { data: modifications } = await supabase
        .from('transaction_occurrences')
        .select('*')
        .eq('transaction_id', transaction.id)
        .gte('occurrence_date', startDate.toISOString().split('T')[0])
        .lte('occurrence_date', endDate.toISOString().split('T')[0]);
      
      // Fusionner les données
      occurrences.forEach(occ => {
        const mod = modifications?.find(m => m.occurrence_date === occ.occurrence_date);
        if (mod?.is_skipped) return; // Ne pas afficher si sauté
        
        result.push({
          ...transaction,
          date: occ.occurrence_date,
          amount: mod?.modified_amount || occ.amount,
          is_occurrence: true,
          occurrence_id: mod?.id,
          is_modified: mod?.is_modified || false
        });
      });
    } else {
      // Transaction ponctuelle
      const transDate = new Date(transaction.date);
      if (transDate >= startDate && transDate <= endDate) {
        result.push(transaction);
      }
    }
  }
  
  return result.sort((a, b) => new Date(b.date) - new Date(a.date));
}
```

---

## Phase 3 : Intégration objectifs

### 3.1 Lier une transaction à un objectif d'épargne

**Fonctionnalité :** Une transaction peut alimenter un objectif.

#### A. Modification base de données
```sql
ALTER TABLE transactions
ADD COLUMN linked_goal_id UUID REFERENCES savings_goals(id) ON DELETE SET NULL;

-- Index pour améliorer les performances
CREATE INDEX idx_transactions_linked_goal ON transactions(linked_goal_id);
```

#### B. Mise à jour automatique du montant de l'objectif
```sql
CREATE OR REPLACE FUNCTION update_goal_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.linked_goal_id IS NOT NULL) THEN
    -- Ajouter au montant de l'objectif
    UPDATE savings_goals
    SET current_amount = current_amount + NEW.amount,
        updated_at = NOW()
    WHERE id = NEW.linked_goal_id;
    
  ELSIF (TG_OP = 'UPDATE') THEN
    -- Si l'objectif lié a changé
    IF (OLD.linked_goal_id IS DISTINCT FROM NEW.linked_goal_id) THEN
      -- Retirer de l'ancien objectif
      IF (OLD.linked_goal_id IS NOT NULL) THEN
        UPDATE savings_goals
        SET current_amount = current_amount - OLD.amount,
            updated_at = NOW()
        WHERE id = OLD.linked_goal_id;
      END IF;
      
      -- Ajouter au nouvel objectif
      IF (NEW.linked_goal_id IS NOT NULL) THEN
        UPDATE savings_goals
        SET current_amount = current_amount + NEW.amount,
            updated_at = NOW()
        WHERE id = NEW.linked_goal_id;
      END IF;
    ELSIF (NEW.linked_goal_id IS NOT NULL AND OLD.amount != NEW.amount) THEN
      -- Si le montant a changé
      UPDATE savings_goals
      SET current_amount = current_amount - OLD.amount + NEW.amount,
          updated_at = NOW()
      WHERE id = NEW.linked_goal_id;
    END IF;
    
  ELSIF (TG_OP = 'DELETE' AND OLD.linked_goal_id IS NOT NULL) THEN
    -- Retirer de l'objectif
    UPDATE savings_goals
    SET current_amount = current_amount - OLD.amount,
        updated_at = NOW()
    WHERE id = OLD.linked_goal_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_goal_amount_on_transaction
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_goal_on_transaction();
```

#### C. Modification du modal de transaction
```jsx
// Ajouter dans AddTransactionModal.jsx
const [savingsGoals, setSavingsGoals] = useState([]);

useEffect(() => {
  if (isOpen && formData.type === 'income') {
    loadSavingsGoals();
  }
}, [isOpen, formData.type]);

const loadSavingsGoals = async () => {
  const goals = await getSavingsGoals(accountId);
  setSavingsGoals(goals);
};

// Dans le formulaire
{formData.type === 'income' && (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Lier à un objectif (optionnel)
    </label>
    <select
      value={formData.linked_goal_id || ''}
      onChange={(e) => setFormData({ ...formData, linked_goal_id: e.target.value || null })}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
    >
      <option value="">Aucun objectif</option>
      {savingsGoals.map(goal => (
        <option key={goal.id} value={goal.id}>
          {goal.icon} {goal.name} ({goal.current_amount}€ / {goal.target_amount}€)
        </option>
      ))}
    </select>
  </div>
)}
```

---

## Modifications base de données

### Script SQL complet des modifications

```sql
-- ============================================
-- MODIFICATIONS POUR FONCTIONNALITÉS AVANCÉES
-- ============================================

-- 1. Validation des transactions
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS is_validated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS validated_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS validated_by UUID REFERENCES auth.users(id);

-- 2. Lien avec objectifs d'épargne
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS linked_goal_id UUID REFERENCES savings_goals(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_linked_goal ON transactions(linked_goal_id);

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

CREATE POLICY "Users can view own occurrences" ON transaction_occurrences
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM transactions t 
    WHERE t.id = transaction_occurrences.transaction_id 
    AND t.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage own occurrences" ON transaction_occurrences
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM transactions t 
    WHERE t.id = transaction_occurrences.transaction_id 
    AND t.user_id = auth.uid()
  )
);

-- 4. Trigger pour mise à jour automatique du solde
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE accounts 
    SET current_balance = current_balance + 
      CASE WHEN NEW.type = 'income' THEN NEW.amount ELSE -NEW.amount END,
      updated_at = NOW()
    WHERE id = NEW.account_id;
    
  ELSIF (TG_OP = 'UPDATE') THEN
    UPDATE accounts 
    SET current_balance = current_balance - 
      CASE WHEN OLD.type = 'income' THEN OLD.amount ELSE -OLD.amount END
    WHERE id = OLD.account_id;
    
    UPDATE accounts 
    SET current_balance = current_balance + 
      CASE WHEN NEW.type = 'income' THEN NEW.amount ELSE -NEW.amount END,
      updated_at = NOW()
    WHERE id = NEW.account_id;
    
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE accounts 
    SET current_balance = current_balance - 
      CASE WHEN OLD.type = 'income' THEN OLD.amount ELSE -OLD.amount END,
      updated_at = NOW()
    WHERE id = OLD.account_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_balance_on_transaction ON transactions;
CREATE TRIGGER update_balance_on_transaction
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_account_balance();

-- 5. Trigger pour mise à jour des objectifs d'épargne
CREATE OR REPLACE FUNCTION update_goal_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.linked_goal_id IS NOT NULL) THEN
    UPDATE savings_goals
    SET current_amount = current_amount + NEW.amount,
        updated_at = NOW()
    WHERE id = NEW.linked_goal_id;
    
  ELSIF (TG_OP = 'UPDATE') THEN
    IF (OLD.linked_goal_id IS DISTINCT FROM NEW.linked_goal_id) THEN
      IF (OLD.linked_goal_id IS NOT NULL) THEN
        UPDATE savings_goals
        SET current_amount = current_amount - OLD.amount,
            updated_at = NOW()
        WHERE id = OLD.linked_goal_id;
      END IF;
      
      IF (NEW.linked_goal_id IS NOT NULL) THEN
        UPDATE savings_goals
        SET current_amount = current_amount + NEW.amount,
            updated_at = NOW()
        WHERE id = NEW.linked_goal_id;
      END IF;
    ELSIF (NEW.linked_goal_id IS NOT NULL AND OLD.amount != NEW.amount) THEN
      UPDATE savings_goals
      SET current_amount = current_amount - OLD.amount + NEW.amount,
          updated_at = NOW()
      WHERE id = NEW.linked_goal_id;
    END IF;
    
  ELSIF (TG_OP = 'DELETE' AND OLD.linked_goal_id IS NOT NULL) THEN
    UPDATE savings_goals
    SET current_amount = current_amount - OLD.amount,
        updated_at = NOW()
    WHERE id = OLD.linked_goal_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_goal_amount_on_transaction ON transactions;
CREATE TRIGGER update_goal_amount_on_transaction
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_goal_on_transaction();
```

---

## Ordre d'implémentation recommandé

### Étape 1 : Base (1-2 heures)
1. ✅ Exécuter le script SQL des modifications
2. ✅ Créer MonthNavigator component
3. ✅ Ajouter bouton "Voir plus" pour transactions

### Étape 2 : Validation (2-3 heures)
4. Ajouter fonctionnalités de validation
5. Interface pour marquer transactions validées
6. Indicateur visuel transactions validées/non validées

### Étape 3 : Édition (3-4 heures)
7. Créer EditTransactionModal
8. Ajouter boutons éditer/supprimer
9. Gestion confirmations suppression

### Étape 4 : Récurrences (4-5 heures)
10. Implémenter génération occurrences
11. Interface modification occurrence spécifique
12. Système de saut d'occurrence
13. Affichage avec indicateurs (modifié/origine)

### Étape 5 : Objectifs (2-3 heures)
14. Ajouter sélecteur objectif dans modal transaction
15. Affichage transactions liées dans objectif
16. Historique contributions objectif

---

## Estimation totale

**Temps de développement :** 12-17 heures
**Complexité :** Moyenne à élevée
**Dépendances :** Phases séquentielles recommandées

---

## Notes importantes

1. **Tests requis :** Chaque phase nécessite des tests approfondis
2. **Sauvegarde :** Toujours sauvegarder la base de données avant modifications SQL
3. **Performances :** Ajouter des index si nécessaire pour grandes quantités de données
4. **UX :** Prévoir animations et feedbacks utilisateur
5. **Erreurs :** Gestion robuste des cas limites et erreurs

---

## Contact et support

Pour toute question sur l'implémentation de ces fonctionnalités, référez-vous à ce document et aux fichiers de code associés.

**Dernière mise à jour :** 14 mars 2026