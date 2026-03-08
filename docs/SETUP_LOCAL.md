# Setup Local sans Docker

Guide pour démarrer le projet Monity localement sans Docker.

## Prérequis

- Python 3.11+
- Node.js 18+
- Git

## 1. Configuration du Backend

### Étape 1: Créer l'environnement virtuel Python

```bash
cd backend

# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### Étape 2: Installer les dépendances

```bash
pip install -r requirements.txt
```

### Étape 3: Configurer les variables d'environnement

Le fichier `.env` est déjà créé avec SQLite pour le développement local:

```env
FLASK_ENV=development
FLASK_APP=app.py
SECRET_KEY=dev-secret-key-change-in-production
JWT_SECRET_KEY=dev-jwt-secret-key-change-in-production
DATABASE_URL=sqlite:///monity.db
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
DEBUG=True
```

### Étape 4: Démarrer le serveur

```bash
python app.py
```

Le backend sera disponible sur **http://localhost:5000**

### Vérifier que le backend fonctionne

```bash
curl http://localhost:5000/api/health
```

Vous devriez recevoir:
```json
{"status": "healthy"}
```

## 2. Configuration du Frontend

### Étape 1: Installer les dépendances

```bash
cd frontend
npm install
```

### Étape 2: Vérifier le .env

Le fichier `.env` est déjà créé:

```env
VITE_API_URL=http://localhost:5000/api
VITE_DEBUG=true
```

### Étape 3: Installer Tailwind CSS (si nécessaire)

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Étape 4: Démarrer le serveur de développement

```bash
npm run dev
```

Le frontend sera disponible sur **http://localhost:5173**

## 3. Test du Projet

### Tester l'authentification

1. Aller sur http://localhost:5173
2. Cliquer sur "S'inscrire"
3. Créer un compte avec:
   - Email: `test@example.com`
   - Username: `testuser`
   - Password: `password123`

4. Après inscription, vous serez redirigé au dashboard

### Tester via cURL (Backend)

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe"
  }'

# Login (recevrez un access_token)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Utiliser le token pour accéder aux routes protégées
curl -X GET http://localhost:5000/api/accounts \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 4. Structure des Fichiers Créés

### Backend
```
backend/
├── .env                  # Configuration locale (SQLite)
├── app.py               # Application Flask
├── config.py            # Configurations
├── models.py            # Modèles SQLAlchemy
├── routes/              # Routes API
│   ├── auth.py
│   ├── users.py
│   ├── accounts.py
│   ├── transactions.py
│   ├── categories.py
│   └── budgets.py
└── requirements.txt     # Dépendances Python
```

### Frontend
```
frontend/
├── .env                 # Variables d'environnement
├── src/
│   ├── services/        # API services
│   │   ├── api.js       # Axios instance
│   │   ├── authService.js
│   │   ├── accountService.js
│   │   └── transactionService.js
│   ├── context/         # Context API
│   │   └── AuthContext.jsx
│   ├── hooks/           # Custom hooks
│   │   └── useAuth.js
│   ├── components/      # Composants React
│   │   ├── Auth/
│   │   │   ├── LoginForm.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   └── Common/
│   │       └── Navbar.jsx
│   └── App.jsx          # Application principale
└── package.json         # Dépendances npm
```

## 5. Base de Données

### Avec SQLite (Par défaut)

La base de données SQLite (`monity.db`) sera créée automatiquement au premier démarrage du backend.

L'ORM SQLAlchemy créera les tables automatiquement.

### Migrer vers PostgreSQL (Production)

Si vous voulez utiliser PostgreSQL:

1. Installer PostgreSQL
2. Créer une base de données:
   ```bash
   createdb monity_db
   ```

3. Modifier `.env`:
   ```env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/monity_db
   ```

4. Redémarrer le backend

## 6. Dépannage

### Erreur "Port déjà utilisé"

Si le port 5000 ou 5173 est déjà utilisé:

**Backend:**
```bash
python app.py
# Modifier le port dans app.py:
app.run(debug=True, host='0.0.0.0', port=5001)
```

**Frontend:**
```bash
npm run dev -- --port 5174
```

### Erreur "connexion refusée"

Vérifier que le backend est en cours d'exécution:
```bash
curl http://localhost:5000/api/health
```

### Module non trouvé (Python)

Vérifier que l'environnement virtuel est activé:
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### Erreur CORS

Vérifier que `CORS_ORIGINS` contient votre URL frontend:
```env
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

## 7. Prochaines Étapes

1. **Implémenter les pages manquantes:**
   - RegisterForm.jsx
   - DashboardPage avec graphiques
   - AccountsPage avec liste des comptes
   - TransactionsPage

2. **Ajouter les services:**
   - categoryService.js
   - budgetService.js
   - userService.js

3. **Ajouter des composants:**
   - AccountForm
   - TransactionForm
   - CategoryForm
   - BudgetForm

4. **Tester les endpoints API** avec Postman

5. **Ajouter des tests** (pytest pour backend, jest pour frontend)

6. **Déployer** sur production (Vercel + Heroku ou autre)

## 8. Commandes Utiles

### Backend
```bash
# Activer l'environnement virtuel
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Installer les dépendances
pip install -r requirements.txt

# Lancer le serveur
python app.py

# Accéder à la base de données SQLite
sqlite3 monity.db

# Quitter l'environnement virtuel
deactivate
```

### Frontend
```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Build pour la production
npm run build

# Linting
npm run lint

# Formatage
npm run format
```

## Support

Pour plus d'informations, consulter:
- [GETTING_STARTED.md](./GETTING_STARTED.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)