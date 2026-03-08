# Architecture de la Base de Données - Monity

## Vue d'ensemble

La base de données a été conçue pour supporter une gestion de budget multi-utilisateur avec des comptes personnels et partagés, en respectant la confidentialité et les principes SOLID.

## Modèle de Données

### 1. Utilisateurs (Users)
```
id (UUID)
email (UNIQUE)
username (UNIQUE)
password_hash
first_name
last_name
avatar_url
is_active
created_at
updated_at
```

**Relations:**
- Many-to-Many avec Accounts via user_accounts
- One-to-Many avec Transactions

**Sécurité:**
- Les mots de passe sont hashés avec bcrypt
- Chaque utilisateur ne voit que ses propres données

### 2. Comptes (Accounts)
```
id (UUID)
name
type ('personal' | 'shared')
currency (ISO 4217)
description
initial_balance
current_balance
is_active
created_at
updated_at
```

**Types de comptes:**
- Personal: Compte privé d'un utilisateur
- Shared: Compte partagé entre plusieurs utilisateurs (ex: couple)

**Relations:**
- Many-to-Many avec Users via user_accounts (avec rôle)
- One-to-Many avec Transactions
- One-to-Many avec Budgets
- One-to-Many avec TransactionCategories

### 3. Relation User-Accounts (user_accounts)
```
user_id (FK)
account_id (FK)
role ('owner' | 'member')
joined_at
```

**Rôles:**
- owner: Peut ajouter/supprimer d'autres utilisateurs
- member: Peut gérer les transactions

**Sécurité:**
- La suppression en cascade est configurée pour maintenir l'intégrité
- Vérifie systématiquement que l'utilisateur a accès avant chaque opération

### 4. Catégories de Transactions (TransactionCategories)
```
id (UUID)
account_id (FK)
name
color (hex)
icon
type ('income' | 'expense')
created_at
```

**Caractéristiques:**
- Les catégories sont liées à un compte spécifique
- Chaque compte a ses propres catégories customisées
- Contrainte unique: (account_id, name)

### 5. Transactions
```
id (UUID)
account_id (FK)
category_id (FK, nullable)
created_by (FK)
amount
type ('income' | 'expense')
description
date
is_recurring
recurrence_pattern ('daily', 'weekly', 'monthly', 'yearly')
tags (JSON array)
notes
created_at
updated_at
```

**Fonctionnalités:**
- Support des transactions récurrentes
- Traçabilité complète (qui a créé la transaction)
- Indexés par account_id et date pour les performances
- Mise à jour automatique du solde du compte

### 6. Budgets
```
id (UUID)
account_id (FK)
category_id (FK, nullable)
name
limit_amount
period ('monthly' | 'yearly')
start_date
end_date
alert_threshold (pourcentage)
is_active
created_at
updated_at
```

**Fonctionnalités:**
- Budgets par catégorie ou globaux
- Seuil d'alerte configurable
- Support de périodes différentes

## Architecture de Sécurité

### Contrôle d'Accès (Access Control)

1. **Authentification:**
   - JWT tokens (access + refresh)
   - Durée d'expiration configurable
   - Hash bcrypt pour les mots de passe

2. **Autorisation:**
   - Vérification systématique de l'accès à chaque opération
   - Vérification que l'utilisateur est propriétaire ou membre du compte
   - Isolation des données par compte

### Confidentialité

1. **Données Personnelles:**
   - Chaque utilisateur ne voit que les comptes auxquels il a accès
   - Les informations d'autres utilisateurs ne sont exposées qu'en contexte partagé

2. **Comptes Partagés:**
   - Tous les propriétaires/membres d'un compte partagé en voient les transactions
   - Les rôles contrôlent les permissions de gestion

3. **Suppression de Données:**
   - Suppression en cascade pour maintenir l'intégrité
   - Possibilité d'implémenter soft-delete si audit trail requis

## Requêtes Principales

### Obtenir tous les comptes d'un utilisateur:
```sql
SELECT a.* FROM accounts a
JOIN user_accounts ua ON a.id = ua.account_id
WHERE ua.user_id = ?
```

### Obtenir les transactions d'un compte:
```sql
SELECT * FROM transactions
WHERE account_id = ?
ORDER BY date DESC
```

### Vérifier les permissions:
```sql
SELECT COUNT(*) FROM user_accounts
WHERE user_id = ? AND account_id = ? AND role IN ('owner', 'member')
```

## Considérations de Performance

1. **Indexes:**
   - user_id, account_id uniquement indexés dans user_accounts
   - account_id indexé dans transactions
   - email, username dans users

2. **Pagination:**
   - Les transactions sont paginées (20 par défaut)
   - Limite les téléchargements de données

3. **Relations:**
   - Lazy loading configuré pour éviter les requêtes N+1
   - Inclusion optionnelle de relations via paramètres

## Principes SOLID Appliqués

### Single Responsibility:
- Chaque modèle gère une entité spécifique
- Les routes gèrent les opérations métier

### Open/Closed:
- Architecture extensible pour nouveaux types de comptes/catégories
- Support pour différentes cryptomonnaies

### Liskov Substitution:
- Les modèles SQLAlchemy suivent les contrats définis

### Interface Segregation:
- Routes séparées par domaine (auth, users, accounts, etc.)
- Méthodes to_dict() controllent l'exposition des données

### Dependency Inversion:
- Utilisation de blueprints Flask pour l'injection
- SQLAlchemy abstrait la base de données

## Migrations Futures

Pour ajouter de nouvelles fonctionnalités:

1. **Audit Trail:**
   - Ajouter une table audit_logs pour tracer tous les changements

2. **Notifications:**
   - Ajouter table notifications pour alertes budget

3. **Récursivité Avancée:**
   - Implémenter logique cron pour transactions récurrentes

4. **Reports:**
   - Ajouter table reports pour saved queries

5. **Partage Granulaire:**
   - Ajouter permissions par catégorie/transaction