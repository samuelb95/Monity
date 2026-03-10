# Configuration Supabase pour Monity

Ce guide explique comment configurer Supabase pour l'authentification dans Monity.

## 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez votre `Project URL` et `Anon Public Key`

## 2. Configurer les variables d'environnement

Copiez le fichier `.env.example` en `.env.local`:

```bash
cp .env.example .env.local
```

Puis complétez les variables:

```
VITE_SUPABASE_URL=votre_project_url
VITE_SUPABASE_ANON_KEY=votre_anon_key
```

## 3. Configurer l'authentification

### Google OAuth

1. Allez dans Supabase Dashboard → Authentication → Providers
2. Activez Google
3. Entrez vos Google Client ID et Secret (depuis Google Cloud Console)
4. Configurez les redirect URLs:
   - `http://localhost:5173/auth/callback`
   - `https://votre-domaine.com/auth/callback`

### Facebook OAuth

1. Allez dans Supabase Dashboard → Authentication → Providers
2. Activez Facebook
3. Entrez vos Facebook App ID et App Secret
4. Configurez les redirect URLs dans Facebook Developer Console

## 4. Tables de base de données

Les tables nécessaires seront créées automatiquement par Supabase pour l'authentification:
- `auth.users` - Gérée par Supabase
- `public.profiles` - À créer pour les profils utilisateur (optionnel)

## 5. Utilisation

```javascript
import { supabase } from './config/supabase';

// Connexion avec email/mot de passe
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Inscription
const { data, error } = await supabase.auth.signUp({
  email: 'newuser@example.com',
  password: 'password'
});

// Connexion avec Google
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google'
});

// Récupérer l'utilisateur actuel
const { data: { user } } = await supabase.auth.getUser();

// Se déconnecter
await supabase.auth.signOut();
```

## 6. Sécurité

- Ne commitez jamais votre `.env.local` en production
- Utilisez des variables d'environnement en production
- Activez Email Confirmations dans Supabase pour sécuriser les inscriptions
- Configurez les Row Level Security (RLS) pour les données sensibles

## 7. Documentation complète

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)