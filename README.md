# 🎯 MONITY - Supabase Only Architecture

Finance management app with React + Supabase. No backend required.

## 🚀 Quick Start

### 1. Create Supabase Project
```bash
# Go to https://supabase.com
# Create new project
# Copy credentials
```

### 2. Setup Environment
```bash
cd frontend
cp .env.example .env.local

# Add your Supabase credentials:
# VITE_SUPABASE_URL=https://xxxxx.supabase.co
# VITE_SUPABASE_KEY=eyJhbGc...
```

### 3. Create Database Tables
Execute SQL from `SUPABASE_INTEGRATION.md` in Supabase SQL Editor

### 4. Start Development
```bash
npm run dev
# http://localhost:5173
```

## 📚 Documentation

- **`NOBACKEND_SETUP.md`** - Complete setup guide
- **`SUPABASE_INTEGRATION.md`** - Database schema & SQL
- **`FLUX_DONNEES_SUPABASE.md`** - How data flows
- **`CONFIDENTIALITE_E2E.md`** - End-to-end encryption

## ✨ Features

✅ Authentication (Google, GitHub, Facebook, Email)
✅ Account Management
✅ Transaction Tracking
✅ Budget Planning
✅ Category Management
✅ User Preferences
✅ Real-time Updates
✅ End-to-End Encryption (Optional)
✅ Row Level Security (RLS)

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Styling**: Tailwind CSS
- **Encryption**: SubtleCrypto (native)

## 📂 Project Structure

```
frontend/
├── src/
│   ├── components/       # React components
│   ├── pages/           # Page components
│   ├── services/
│   │   ├── supabaseService.js   # Supabase queries
│   │   ├── encryptionService.js # E2E encryption
│   │   └── authService.js       # Auth helpers
│   ├── context/         # React context
│   ├── hooks/           # Custom hooks
│   ├── config/          # Supabase config
│   └── styles/          # CSS files
├── index.html
├── vite.config.js
└── tailwind.config.js
```

## 🔐 Security

- **RLS Enabled**: Users only see their own data
- **Optional E2E Encryption**: AES-GCM via SubtleCrypto
- **Secure Credentials**: Use `.env.local` (never commit)
- **Session Management**: Automatic token refresh

## 🌐 Deploy

### Vercel
```bash
git push origin noBackend
# Connect repo to Vercel
# Add env vars
# Deploy!
```

### Other Platforms
See Vite docs for build & deploy options

## 📖 Services Reference

### Accounts
```javascript
import { getAccounts, createAccount } from './services/supabaseService'
```

### Transactions
```javascript
import { getTransactions, createTransaction } from './services/supabaseService'
```

### Real-time
```javascript
import { subscribeToTransactions } from './services/supabaseService'
```

See `supabaseService.js` for full API

## 🔧 Customization

- Edit `frontend/tailwind.config.js` for styling
- Modify `supabaseService.js` for queries
- Add new pages in `frontend/src/pages/`

## 📞 Support

- Supabase Docs: https://supabase.com/docs
- React Docs: https://react.dev
- Vite Docs: https://vitejs.dev

## 📝 License

MIT