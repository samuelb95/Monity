# 🚀 QUICK START - Monity + Supabase

## ✅ Vous avez déjà:

- ✅ Project URL: `https://cgcqbexjfpicfkzievzc.supabase.co`
- ✅ API Key: `sb_publishable_7ikZPQGpQkZaxJ2mOM6dXg_9IaCROVv`
- ✅ Credentials dans `frontend/.env.local`

## 🎯 ÉTAPE 1: Créer les Tables (5 minutes)

1. Allez sur https://cgcqbexjfpicfkzievzc.supabase.co
2. Cliquez sur **SQL Editor** (à gauche)
3. Cliquez **New Query**
4. Copier/coller le contenu de `SUPABASE_SETUP.sql`
5. Cliquez **RUN**

✅ Tables créées!

## 🎮 ÉTAPE 2: Tester Localement

```bash
cd frontend
npm install
npm run dev
```

Allez sur: **http://localhost:5173**

## ✨ Qu'est-ce que vous pouvez faire:

### ✅ Se connecter
- Google, Facebook, GitHub
- Email/Password

### ✅ Ajouter des données
- Comptes bancaires
- Transactions
- Catégories
- Budgets
- Préférences

### ✅ Données sécurisées
- Seulement vous voyez vos données (RLS)
- Chiffrement E2E optionnel

## 🔐 Sécurité

| Données | Où? | Sécurité |
|---------|-----|----------|
| **Clé Publique** | Frontend (.env) | ✅ Visible OK |
| **Clé Secrète** | Supabase seulement | ✅ Jamais au frontend |
| **Vos données** | Supabase | ✅ RLS + E2E optionnel |

## 🐛 Troubleshooting

### Erreur: "No data returned"
→ Assurez-vous que SQL a été exécuté dans Supabase

### Erreur: "Invalid API key"
→ Vérifiez que `.env.local` a les bonnes valeurs

### Erreur: "RLS policy violation"
→ Normal si tables vides. Créez un compte d'abord!

## 📞 Besoin d'aide?

- Lire `README.md` pour l'architecture
- Voir `SUPABASE_INTEGRATION.md` pour SQL complet
- Voir `FLUX_DONNEES_SUPABASE.md` pour API

## 🎉 C'est Prêt!

Vous pouvez maintenant:
1. ✅ Vous connecter
2. ✅ Ajouter des transactions
3. ✅ Déployer sur Vercel

**Bon courage! 🚀**