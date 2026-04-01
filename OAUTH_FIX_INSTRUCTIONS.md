# 🔐 CORRECTION AUTHENTIFICATION OAUTH - GOOGLE & FACEBOOK

## ✅ Corrections appliquées au code

Le fichier `frontend/src/services/authService.js` a été corrigé:
- Le `redirectTo` pour Google et Facebook utilise maintenant: `${window.location.origin}/auth/callback`
- Suppression de la manipulation inutile `.replace('http://', 'http://').replace('https://', 'https://')`

## 🔧 ÉTAPES ESSENTIELLES À FAIRE DANS SUPABASE

### Étape 1: Configurer les URLs de redirection dans Supabase

1. Allez sur: https://cgcqbexjfpicfkzievzc.supabase.co
2. Connectez-vous avec votre compte
3. Cliquez sur **Authentication** (à gauche)
4. Cliquez sur **URL Configuration**
5. Sous "Redirect URLs", ajoutez ces URLs:
   ```
   http://localhost:5173/auth/callback
   http://localhost:5173
   http://localhost:5173/login
   http://localhost:5173/register
   ```
6. Cliquez sur **Save**

### Étape 2: Configuration Google OAuth

1. Dans le dashboard Supabase, allez à **Authentication** → **Providers**
2. Cliquez sur **Google**
3. Notez le **Redirect URL** affiché par Supabase (exemple: `https://cgcqbexjfpicfkzievzc.supabase.co/auth/v1/callback?provider=google`)
4. Allez sur: https://console.cloud.google.com/
5. Sélectionnez votre projet
6. Allez à **APIs & Services** → **Credentials**
7. Cliquez sur votre application OAuth 2.0
8. Cliquez **Modifier l'application OAuth** (ou "Edit")
9. Sous **URIs de redirection autorisés** (Authorized redirect URIs), ajoutez:
   ```
   https://cgcqbexjfpicfkzievzc.supabase.co/auth/v1/callback?provider=google
   http://localhost:5173/auth/callback
   http://localhost:5173
   ```
10. Cliquez **Save**
11. Retournez dans Supabase et remplissez:
    - **Client ID**: (depuis Google Cloud Console)
    - **Client Secret**: (depuis Google Cloud Console)
12. Cliquez **Save** dans Supabase

### Étape 3: Configuration Facebook OAuth

1. Dans le dashboard Supabase, allez à **Authentication** → **Providers**
2. Cliquez sur **Facebook**
3. Notez le **Redirect URL** affiché par Supabase
4. Allez sur: https://developers.facebook.com/
5. Allez à votre application
6. Dans **Settings** → **Basic**, notez votre **App ID** et **App Secret**
7. Allez à **Settings** → **Basic** → **App Domains**, ajoutez:
   ```
   localhost
   localhost:5173
   ```
8. Allez à **Products** → **Facebook Login** → **Settings**
9. Sous **Valid OAuth Redirect URIs**, ajoutez le Redirect URL de Supabase:
   ```
   https://cgcqbexjfpicfkzievzc.supabase.co/auth/v1/callback?provider=facebook
   http://localhost:5173/auth/callback
   ```
10. Cliquez **Save Changes**
11. Retournez dans Supabase et remplissez:
    - **App ID**: (depuis Facebook Developers)
    - **App Secret**: (depuis Facebook Developers)
12. Cliquez **Save** dans Supabase

## 🧪 Test de l'OAuth

### Test Email/Password (fonctionne toujours)
1. Allez sur `http://localhost:5173/register`
2. Créez un compte avec email et mot de passe
3. Si cela fonctionne, le problème est spécifique à OAuth

### Test Google OAuth
1. Allez sur `http://localhost:5173/login`
2. Cliquez sur le bouton **Google**
3. Vous devriez être redirigé vers Google
4. Après authentification, vous devriez être redirigé vers `/auth/callback`
5. Vérifiez la console (F12) pour les logs

### Test Facebook OAuth
1. Allez sur `http://localhost:5173/login`
2. Cliquez sur le bouton **Facebook**
3. Vous devriez être redirigé vers Facebook
4. Après authentification, vous devriez être redirigé vers `/auth/callback`
5. Vérifiez la console (F12) pour les logs

## 🔍 Déboguer les problèmes

Ouvrez la console (F12) et cherchez:

### Si vous voyez: "Auth session missing!"
→ C'est un problème de Redirect URLs
→ Vérifiez que les URLs dans Google Cloud Console et Facebook Developers correspondent exactement à celles dans Supabase

### Si la redirection ne fonctionne pas
→ Testez en mode **incognito** (cache navigateur peut causer des problèmes)
→ Vérifiez que `http://localhost:5173/auth/callback` est configuré partout

### Si vous voyez: "Invalid OAuth credentials"
→ Vérifiez que Client ID et Client Secret sont corrects
→ Attendez quelques minutes que les changements prennent effet

## 📋 Checklist de vérification

- [ ] URLs de redirection ajoutées dans Supabase (URL Configuration)
- [ ] Google Client ID et Secret configurés dans Supabase
- [ ] Google Redirect URLs configurées dans Google Cloud Console
- [ ] Facebook App ID et Secret configurés dans Supabase
- [ ] Facebook Redirect URLs configurées dans Facebook Developers
- [ ] Test Email/Password réussi
- [ ] Test Google OAuth réussi
- [ ] Test Facebook OAuth réussi

## ⚠️ Points importants

1. **Les URLs doivent correspondre exactement** - pas d'espaces, pas de caractères différents
2. **Attendez quelques minutes** après les modifications pour que les changements prennent effet
3. **Testez en incognito** pour éviter les problèmes de cache
4. **Vérifiez les logs** (F12) pour voir les erreurs exactes

## 🔗 Ressources utiles

- [Docs Supabase Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Docs Supabase Facebook OAuth](https://supabase.com/docs/guides/auth/social-login/auth-facebook)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Facebook Developers](https://developers.facebook.com/)