# 🚀 SETUP NOBACKEND - Monity sans Backend Python

## 📋 Prérequis

- ✅ React + Vite frontend (prêt)
- ✅ Services Supabase (prêts)
- ✅ Chiffrement E2E (SubtleCrypto natif)
- ✅ Zéro dépendances externes pour chiffrement

## 🎯 Étape 1: Créer un Compte Supabase

1. Allez sur https://supabase.com
2. Créez un nouveau projet
3. Attendez l'initialisation (~2 min)
4. Notez vos credentials dans Settings → API:
   - `VITE_SUPABASE_URL` = Project URL
   - `VITE_SUPABASE_KEY` = anon public key

## 🔧 Étape 2: Ajouter les Credentials

Modifiez `frontend/.env.local`:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_KEY=eyJhbGc...
```

## 📊 Étape 3: Créer les Tables

Dans Supabase, allez à **SQL Editor** et exécutez le code de `SUPABASE_INTEGRATION.md` (section SQL)

Ou copier/coller ceci dans SQL Editor:

```sql
-- Voir SUPABASE_INTEGRATION.md pour le code complet
```

## 🎮 Étape 4: Tester Localement

```bash
cd frontend
npm run dev
# http://localhost:5173
```

## ✨ Qu'est-ce qui Fonctionne

### ✅ Authentication
- Google, GitHub, Facebook (Supabase Auth)
- Email/Password

### ✅ Données
- Comptes bancaires
- Transactions
- Catégories
- Budgets
- Préférences

### ✅ Sécurité
- RLS (Row Level Security)
- Chiffrement E2E optionnel (SubtleCrypto)
- Zéro dépendances externes

## 📂 Fichiers Clés

| Fichier | Rôle |
|---------|------|
| `frontend/src/services/supabaseService.js` | API Supabase |
| `frontend/src/services/encryptionService.js` | Chiffrement E2E |
| `frontend/src/config/supabase.js` | Initialisation Supabase |
| `SUPABASE_INTEGRATION.md` | SQL + RLS |
| `CONFIDENTIALITE_E2E.md` | Documentation chiffrement |

## 🚀 Deploy sur Vercel

```bash
# 1. Push la branche noBackend
git push origin noBackend

# 2. Sur Vercel, connecter le repo
# 3. Ajouter les env vars
# 4. Deploy!
```

## ⚡ Bonnes Pratiques

✅ **À faire:**
- Garder credentials en `.env.local` (jamais committer)
- Activer RLS sur toutes les tables
- Tester l'E2E en dev

❌ **À éviter:**
- Committer les credentials
- Désactiver RLS
- Envoyer clés secrètes au serveur

## 📞 Support

- Docs Supabase: https://supabase.com/docs
- Voir `FLUX_DONNEES_SUPABASE.md` pour exemples
- Voir `CONFIDENTIALITE_E2E.md` pour chiffrement

## 🎉 C'est Prêt!

Tout fonctionne sans serveur Python. Prêt à démarrer! 🚀