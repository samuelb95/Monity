# 🔐 CONFIDENTIALITÉ END-TO-END (E2E) - MONITY

## 🎯 Le Problème

**Sans chiffrement:**
- ✅ Vous = voyez vos données
- ⚠️ Supabase Admin = peut voir vos données
- ⚠️ Hackers = peuvent voir si BD compromise

**Avec chiffrement E2E:**
- ✅ Vous = voyez vos données (déchiffrées en local)
- ✅ Supabase = voit que du charabia
- ✅ Hackers = reçoivent du charabia inutile

## 🔑 Solution: TweetNaCl.js + Supabase

### Architecture
```
Frontend React
    ↓
Chiffrer les données (TweetNaCl)
    ↓
Envoyer -> Supabase (données illisibles)
    ↓
Récupérer de Supabase (charabia)
    ↓
Déchiffrer en local (TweetNaCl)
    ↓
Afficher à l'utilisateur
```

## 1️⃣ Installation

```bash
cd frontend
npm install tweetnacl-js
```

## 2️⃣ Créer un Service de Chiffrement

Créez `frontend/src/services/encryptionService.js`:

```javascript
import nacl from 'tweetnacl-js'
import { encodeBase64, decodeBase64 } from 'tweetnacl-js/nacl'

// Encoder/Décoder en Base64 pour stocker en BD
function encodeBase64(array) {
  return btoa(String.fromCharCode.apply(null, array))
}

function decodeBase64(str) {
  return new Uint8Array(atob(str).split('').map(c => c.charCodeAt(0)))
}

/**
 * Génère une clé de chiffrement pour l'utilisateur
 * À faire UNE FOIS lors de l'inscription
 */
export function generateEncryptionKey() {
  const keyPair = nacl.box.keyPair()
  return {
    publicKey: encodeBase64(keyPair.publicKey),
    secretKey: encodeBase64(keyPair.secretKey)
  }
}

/**
 * Chiffre un objet avant d'envoyer à Supabase
 */
export function encryptData(data, secretKey) {
  const secretKeyBytes = decodeBase64(secretKey)
  const plaintext = new TextEncoder().encode(JSON.stringify(data))
  
  // Générer une nonce aléatoire
  const nonce = nacl.randomBytes(nacl.box.nonceLength)
  
  // Chiffrer avec la clé secrète
  const encrypted = nacl.secretbox(plaintext, nonce, secretKeyBytes)
  
  // Retourner nonce + données chiffrées en Base64
  return {
    nonce: encodeBase64(nonce),
    ciphertext: encodeBase64(encrypted)
  }
}

/**
 * Déchiffre les données reçues de Supabase
 */
export function decryptData(encrypted, secretKey) {
  const secretKeyBytes = decodeBase64(secretKey)
  const nonce = decodeBase64(encrypted.nonce)
  const ciphertext = decodeBase64(encrypted.ciphertext)
  
  // Déchiffrer
  const plaintext = nacl.secretbox.open(ciphertext, nonce, secretKeyBytes)
  
  if (!plaintext) {
    throw new Error('Impossible de déchiffrer les données')
  }
  
  // Convertir en string et parser JSON
  const decrypted = new TextDecoder().decode(plaintext)
  return JSON.parse(decrypted)
}
```

## 3️⃣ Modifier les Tables Supabase

Ajouter les champs de chiffrement:

```sql
-- Mettre à jour la table transactions
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS
  encrypted_data JSONB DEFAULT NULL;

ALTER TABLE transactions ADD COLUMN IF NOT EXISTS
  is_encrypted BOOLEAN DEFAULT FALSE;

-- Même chose pour budgets
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS
  encrypted_data JSONB DEFAULT NULL;

ALTER TABLE budgets ADD COLUMN IF NOT EXISTS
  is_encrypted BOOLEAN DEFAULT FALSE;

-- Et pour goals (si vous l'avez créée)
ALTER TABLE goals ADD COLUMN IF NOT EXISTS
  encrypted_data JSONB DEFAULT NULL;

ALTER TABLE goals ADD COLUMN IF NOT EXISTS
  is_encrypted BOOLEAN DEFAULT FALSE;

-- Ajouter la clé publique au profil (pour partage optionnel)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS
  public_key TEXT;
```

## 4️⃣ Sauvegarder les Clés de l'Utilisateur

À faire lors de l'inscription:

```javascript
// frontend/src/pages/RegisterPage.jsx
import { generateEncryptionKey, encryptData } from '../services/encryptionService'
import { supabase } from '../config/supabase'

export async function handleRegister(email, password) {
  // 1. Créer compte Supabase
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })
  
  if (error) throw error
  
  const user = data.user
  
  // 2. Générer les clés de chiffrement
  const { publicKey, secretKey } = generateEncryptionKey()
  
  // 3. Sauvegarder les clés dans le profil
  // ⚠️ La clé secrète doit rester sur l'appareil de l'utilisateur!
  await supabase
    .from('profiles')
    .insert([
      {
        id: user.id,
        email: user.email,
        public_key: publicKey,
        // ❌ NE PAS envoyer secretKey à Supabase!
      }
    ])
  
  // 4. Sauvegarder la clé secrète LOCALEMENT (localStorage ou IndexedDB)
  localStorage.setItem(`encryption_key_${user.id}`, secretKey)
  
  return user
}
```

## 5️⃣ Ajouter une Transaction Chiffrée

```javascript
// frontend/src/services/supabaseService.js
import { encryptData } from './encryptionService'
import { supabase } from '../config/supabase'

export async function createTransactionEncrypted(
  transactionData,
  userSecretKey
) {
  const { user } = await supabase.auth.getUser()
  
  // Les données en clair
  const plainData = {
    amount: transactionData.amount,
    description: transactionData.description,
    date: transactionData.date,
    notes: transactionData.notes,
    // ❌ PAS d'ID ici, on les ajoute dans le champ "structured"
  }
  
  // Chiffrer les données sensibles
  const encrypted = encryptData(plainData, userSecretKey)
  
  // Envoyer à Supabase
  // ⚠️ Important: on garde account_id,user_id,category_id en clair
  //             car Supabase en a besoin pour le RLS et les relations
  const { data, error } = await supabase
    .from('transactions')
    .insert([
      {
        account_id: transactionData.account_id,
        user_id: user.id,
        category_id: transactionData.category_id,
        type: transactionData.type,
        // Les données sensibles sont chiffrées:
        encrypted_data: encrypted,
        is_encrypted: true,
        // Les métadonnées restent en clair (pour indexation/filtrage)
        date: transactionData.date,
      }
    ])
    .select()
  
  if (error) throw error
  return data[0]
}
```

## 6️⃣ Récupérer et Déchiffrer

```javascript
// frontend/src/services/supabaseService.js
import { decryptData } from './encryptionService'

export async function getTransactionsDecrypted(
  accountId,
  userSecretKey
) {
  // Récupérer de Supabase
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('account_id', accountId)
    .order('date', { ascending: false })
  
  if (error) throw error
  
  // Déchiffrer chaque transaction
  return data.map(transaction => {
    if (transaction.is_encrypted && transaction.encrypted_data) {
      const decrypted = decryptData(
        transaction.encrypted_data,
        userSecretKey
      )
      
      return {
        ...transaction,
        // Fusionner les données déchiffrées
        ...decrypted,
        is_encrypted: false
      }
    }
    
    return transaction
  })
}
```

## 7️⃣ Utiliser dans le Dashboard

```javascript
// frontend/src/pages/DashboardPage.jsx
import { getTransactionsDecrypted } from '../services/supabaseService'

export function DashboardPage() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  
  useEffect(() => {
    async function loadTransactions() {
      // Récupérer la clé secrète du localStorage
      const secretKey = localStorage.getItem(`encryption_key_${user.id}`)
      
      if (!secretKey) {
        console.error('Clé secrète non trouvée')
        return
      }
      
      // Charger et déchiffrer les transactions
      const data = await getTransactionsDecrypted(
        selectedAccountId,
        secretKey
      )
      
      setTransactions(data)
    }
    
    if (user) {
      loadTransactions()
    }
  }, [user])
  
  return (
    <div>
      {transactions.map(t => (
        <div key={t.id}>
          <p>{t.description} - {t.amount}€</p>
        </div>
      ))}
    </div>
  )
}
```

## ✅ Qu'est-ce qui est Chiffré?

| Champ | Chiffré? | Pourquoi |
|-------|----------|---------|
| `amount` | ✅ Oui | Données sensibles |
| `description` | ✅ Oui | Données sensibles |
| `notes` | ✅ Oui | Données sensibles |
| `account_id` | ❌ Non | Supabase en a besoin (RLS) |
| `user_id` | ❌ Non | Supabase en a besoin (RLS) |
| `category_id` | ❌ Non | Supabase en a besoin (relations) |
| `date` | ❌ Non | Supabase doit pouvoir filtrer/trier |

## ⚠️ Considérations Importantes

### 1. Gestion des Clés
```javascript
// ✅ BON: Garder la clé secrète en local
localStorage.setItem(`encryption_key_${user.id}`, secretKey)

// ❌ MAUVAIS: Envoyer la clé secrète à Supabase
supabase.from('profiles').insert({ secret_key: secretKey })
```

### 2. Si l'Utilisateur Perd sa Clé
```javascript
// ❌ Les données ne sont irrécupérables
// Solution: Permettre de réinitialiser avec l'email
```

### 3. Partage (Optionnel)
```javascript
// Pour partager un compte avec quelqu'un:
// 1. Envoyer la clé secrète via canal sécurisé (WhatsApp, Signal)
// 2. Pas via Supabase!
```

## 📊 Sécurité Comparée

| Niveau | Sécurité | Effort |
|--------|----------|--------|
| **Sans chiffrement** | ⚠️ Moyen | ✅ Facile |
| **RLS uniquement** | ⚠️ Moyen | ✅ Facile |
| **E2E TweetNaCl** | ✅ Excellent | ⚠️ Moyen |
| **E2E + HSM** | 🔒 Maximum | ❌ Difficile |

## 🎯 Recommandation

**Pour Monity:**
- ✅ TweetNaCl.js (bon rapport sécurité/complexité)
- ✅ RLS Supabase (contrôle d'accès)
- ✅ Clés locales (jamais envoyées au serveur)

**Résultat:**
- Même Supabase ne peut pas voir vos données 🔐
- Maximum sécurité sans complexité extrême ⚡

## 🚀 Implémentation

1. Installer `tweetnacl-js`
2. Créer `encryptionService.js`
3. Générer clés à l'inscription
4. Chiffrer avant d'envoyer
5. Déchiffrer après récupération

**C'est vraiment ça simple!** ✨