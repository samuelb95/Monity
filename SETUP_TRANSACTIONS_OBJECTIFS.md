# Configuration des Transactions et Objectifs d'Épargne

Ce guide explique comment mettre en place les nouvelles fonctionnalités de gestion des transactions et objectifs d'épargne dans Monity.

## 📋 Vue d'ensemble

Les nouvelles fonctionnalités incluent :

- **Transactions** : Ajout de dépenses et revenus (ponctuels ou récurrents)
- **Objectifs d'épargne** : Création et suivi d'objectifs financiers avec barre de progression

## 🗄️ Étape 1 : Configuration de la base de données

### Créer la table savings_goals

Exécutez le script SQL suivant dans votre console Supabase :

```sql
-- === SAVINGS GOALS TABLE ===
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
CREATE POLICY "Users can view own savings goals" ON savings_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own savings goals" ON savings_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own savings goals" ON savings_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own savings goals" ON savings_goals FOR DELETE USING (auth.uid() = user_id);
```

**Note** : La table `transactions` existe déjà et supporte les transactions récurrentes via les champs `is_recurring` et `recurrence_pattern`.

## 🎯 Étape 2 : Fichiers créés/modifiés

### Nouveaux fichiers créés :

1. **`frontend/src/components/Transactions/AddTransactionModal.jsx`**
   - Modal pour ajouter une transaction (dépense ou revenu)
   - Support des transactions ponctuelles et récurrentes
   - Sélection de catégorie et notes

2. **`frontend/src/components/SavingsGoals/AddSavingsGoalModal.jsx`**
   - Modal pour créer un objectif d'épargne
   - Personnalisation (icône, couleur)
   - Montant cible et montant actuel
   - Date objectif (optionnelle)

### Fichiers modifiés :

1. **`frontend/src/services/supabaseService.js`**
   - Ajout des fonctions CRUD pour savings_goals :
     - `getSavingsGoals(accountId)`
     - `createSavingsGoal(goalData)`
     - `updateSavingsGoal(goalId, updates)`
     - `deleteSavingsGoal(goalId)`
   - Mise à jour de `getDashboardData()` pour inclure les objectifs

2. **`frontend/src/pages/DashboardPage.jsx`**
   - Intégration des deux modals
   - Affichage des objectifs d'épargne avec barres de progression
   - Boutons "Ajouter une transaction" et "Nouvel objectif"

## 🚀 Utilisation

### Ajouter une transaction

1. Accédez au tableau de bord
2. Cliquez sur "Ajouter une transaction" dans la section "Actions rapides"
3. Remplissez le formulaire :
   - **Type** : Dépense ou Revenu
   - **Montant** : Entrez le montant en EUR
   - **Description** : Nom de la transaction
   - **Catégorie** : Sélectionnez une catégorie (optionnel)
   - **Date** : Date de la transaction
   - **Transaction récurrente** : Cochez si la transaction se répète
     - Si récurrente, sélectionnez la fréquence (quotidienne, hebdomadaire, mensuelle, etc.)
   - **Notes** : Informations supplémentaires (optionnel)
4. Cliquez sur "Créer"

### Créer un objectif d'épargne

1. Accédez au tableau de bord
2. Cliquez sur "Nouvel objectif" dans la section "Actions rapides"
3. Remplissez le formulaire :
   - **Nom** : Nom de l'objectif (ex: "Vacances", "Voiture")
   - **Icône** : Choisissez une icône représentative
   - **Couleur** : Sélectionnez une couleur pour identifier l'objectif
   - **Montant objectif** : Montant total à atteindre
   - **Montant actuel** : Montant déjà économisé (par défaut 0)
   - **Date objectif** : Date cible (optionnel)
   - **Description** : Motivation ou détails (optionnel)
4. Un aperçu s'affiche en temps réel
5. Cliquez sur "Créer"

## 📊 Affichage sur le tableau de bord

### Section Transactions
- Les transactions récentes sont affichées dans la section principale
- Différenciation visuelle entre revenus (vert) et dépenses (gris)
- Indication de récurrence si applicable

### Section Objectifs d'épargne
- Affichage dans la colonne de droite
- Icône et nom personnalisés
- Barre de progression colorée
- Montant actuel / Montant cible
- Pourcentage de complétion

## 🔄 Gestion des transactions récurrentes

Les patterns de récurrence disponibles :
- **daily** : Quotidienne
- **weekly** : Hebdomadaire
- **monthly** : Mensuelle (par défaut)
- **quarterly** : Trimestrielle
- **yearly** : Annuelle

## 🎨 Personnalisation des objectifs

### Icônes disponibles :
🎯 💰 🏠 🚗 ✈️ 🎓 💍 🎁 🏖️ 📱 💻 🎮

### Couleurs disponibles :
- Vert (#4CAF50)
- Bleu (#2196F3)
- Orange (#FF9800)
- Violet (#9C27B0)
- Rose (#E91E63)
- Rouge (#F44336)
- Cyan (#00BCD4)
- Indigo (#3F51B5)

## 🔒 Sécurité

- Toutes les opérations sont protégées par Row Level Security (RLS)
- Les utilisateurs ne peuvent voir et modifier que leurs propres données
- Validation des données côté serveur et client

## 🐛 Dépannage

### Les boutons sont désactivés
- Assurez-vous d'avoir au moins un compte créé
- Vérifiez que vous êtes authentifié
- Rechargez la page si nécessaire

### Les transactions n'apparaissent pas
- Vérifiez que la table `transactions` existe dans Supabase
- Vérifiez les politiques RLS
- Consultez la console du navigateur pour les erreurs

### Les objectifs ne s'affichent pas
- Assurez-vous d'avoir exécuté le script SQL pour créer la table `savings_goals`
- Vérifiez les politiques RLS
- Actualisez le tableau de bord

## 📝 Notes importantes

1. **Compte requis** : Un compte doit être créé avant de pouvoir ajouter des transactions ou objectifs
2. **Rechargement automatique** : Le tableau de bord se met à jour automatiquement après chaque ajout
3. **Devise** : Actuellement en EUR uniquement
4. **Suppression** : Les transactions et objectifs sont conservés même si les modals sont fermées

## 🔄 Prochaines étapes

Fonctionnalités futures possibles :
- Modification des transactions existantes
- Historique des contributions aux objectifs
- Notifications pour les objectifs proches de la date limite
- Export des transactions en CSV
- Graphiques de progression des objectifs
- Gestion des transactions récurrentes automatiques