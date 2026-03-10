# Configuration OAuth - Guide Complet

## ✅ Étapes effectuées

Nous avons déjà mis en place:
- ✅ Pages d'authentification (login, register, forgot password)
- ✅ Service Supabase intégré
- ✅ Google OAuth configuré côté Supabase
- ✅ Facebook OAuth configuré côté Supabase
- ✅ Page callback (`/auth/callback`)
- ✅ Gestion d'état avec AuthContext

## 🔴 Problème actuel: "Auth session missing!"

L'erreur `Tentative N: user=false, error=Auth session missing!` signifie que Supabase ne crée pas la session lors du callback OAuth.

## 🔧 Solutions à vérifier dans Supabase Dashboard

### 1. Vérifier les Redirect URLs

**Pour Google: (IMPORTANT - doit être exact)**
```
https://console.cloud.google.com/apis/credentials
```
Clique sur **ta app OAuth 2.0 → Modifier l'application OAuth**

Dans **URIs de redirection autorisés** (Authorized redirect URIs):
- ✅ `http://localhost:5173/auth/callback`
- ✅ `http://localhost:5173`

⚠️ **IMPORTANT**: Il faut que ces URLs correspondent EXACTEMENT à ce que Supabase renvoie. Vérifier aussi dans:
- Supabase Dashboard → Authentication → Providers → Google
- Noter le "Redirect URL" fourni par Supabase
- L'ajouter dans Google Cloud Console si différent

**Pour Facebook:**
```
https://developers.facebook.com/apps/
```
Dans ta config Facebook OAuth:
- Valid OAuth Redirect URIs: `http://localhost:5173/auth/callback`
- Sous App Domains: `localhost:5173`

### 2. Vérifier dans Supabase Dashboard

Aller à: **Authentication → Providers → Google/Facebook**

#### Pour Google:
- [ ] Google Client ID correct
- [ ] Google Client Secret correct
- [ ] **Noter le "Redirect URL" affiché par Supabase**
- [ ] Ajouter ce Redirect URL dans Google Cloud Console

#### Pour Facebook:
- [ ] Facebook App ID correct
- [ ] Facebook App Secret correct
- [ ] **Copier le Redirect URL depuis Supabase**
- [ ] Ajouter dans Facebook Developers sous "Valid OAuth Redirect URIs"

### 3. Vérifier les Redirect URLs Supabase

Aller à: **Authentication → URL Configuration**

Ajouter:
```
http://localhost:5173/auth/callback
http://localhost:5173
http://localhost:5173/login
http://localhost:5173/register
```

**Ces URLs doivent être configurées AVANT de tester OAuth!**

### 4. Alternative: Utiliser une URL publique pendant le dev

Si localhost ne fonctionne pas avec OAuth, utiliser `ngrok`:

```bash
# Installer ngrok
npm install -g ngrok

# Lancer ngrok (dans un autre terminal)
ngrok http 5173

# Ça donne une URL comme: https://xxxxx.ngrok.io
# Ajouter cette URL dans Supabase et les providers OAuth
```

Puis accéder via: `https://xxxxx.ngrok.io/login`

## ✅ Test Email/Password (Fonctionne immédiatement)

1. Aller sur `http://localhost:5173/register`
2. Créer un compte avec email/password
3. Vérifier l'email reçu (ou check Supabase Dashboard)
4. Aller sur `/login` et te connecter

**C'est une bonne façon de tester le site sans attendre que OAuth soit configuré.**

## ⚠️ Problème courant: "Auth session missing!"

Si tu vois cette erreur avec Google ou Facebook:
1. C'est un problème de Redirect URLs
2. Google et Facebook ne savent pas où rediriger après authentification
3. **Solution:**
   - Vérifier dans Google Cloud Console / Facebook Developers
   - Ajouter exactement le Redirect URL que Supabase propose
   - Attendre quelques minutes que les changements prennent effet
   - **Tester en incognito** (cache navigateur peut causer des problèmes)

**Facebook fonctionne = tes URLs sont bien configurées**
**Google ne fonctionne = vérifier Google Cloud Console**

## 📝 Logs pour déboguer

Ouvre la console (F12) et cherche:

```
🔐 OAuth callback détecté
📊 Tentative 1: user=...
```

Si tu vois "Auth session missing!" à chaque tentative, c'est que Supabase n'a pas créé la session - vérifier les Redirect URLs.

## 🔗 Références

- [Supabase Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Supabase Facebook OAuth](https://supabase.com/docs/guides/auth/social-login/auth-facebook)
- [ngrok Documentation](https://ngrok.com/docs/getting-started/)