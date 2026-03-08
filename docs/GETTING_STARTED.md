# Guide de Démarrage - Monity

## Prérequis

- Node.js 18+
- Python 3.11+
- PostgreSQL 15+ (ou Docker)
- Git

## Installation du Projet

### 1. Cloner le dépôt
```bash
git clone <repo_url>
cd Monity
git config user.email "your.email@example.com"
git config user.name "Your Name"
```

### 2. Configuration Backend

#### Setup avec Docker (Recommandé)
```bash
# Lancer les services (PostgreSQL + Backend)
docker-compose up -d

# Vérifier les logs
docker-compose logs -f backend
```

#### Setup Manuel
```bash
cd backend

# Créer environnement virtuel
python -m venv venv

# Activer l'environnement
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos paramètres

# Démarrer le serveur
python app.py
```

Le backend sera disponible sur `http://localhost:5000`

### 3. Configuration Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

Le frontend sera disponible sur `http://localhost:5173`

## Structure du Projet

```
Monity/
├── frontend/                 # React + Vite
│   ├── src/
│   │   ├── components/      # Composants React
│   │   ├── pages/           # Pages de l'application
│   │   ├── services/        # Services API
│   │   ├── hooks/           # Custom hooks
│   │   ├── context/         # Context API
│   │   ├── utils/           # Utilitaires
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/                  # Flask + SQLAlchemy
│   ├── routes/              # Routes API par domaine
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── accounts.py
│   │   ├── transactions.py
│   │   ├── categories.py
│   │   └── budgets.py
│   ├── models.py            # Modèles de données
│   ├── config.py            # Configuration
│   ├── app.py               # Application principale
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── docs/                    # Documentation
│   ├── DATABASE_SCHEMA.md
│   ├── GETTING_STARTED.md
│   ├── API_DOCUMENTATION.md
│   └── ARCHITECTURE.md
│
├── docker-compose.yml       # Orchestration services
└── .gitignore
```

## Configuration des Variables d'Environnement

### Backend (.env)
```env
FLASK_ENV=development
FLASK_APP=app.py
SECRET_KEY=votre-clé-secrète-longue-et-aléatoire
JWT_SECRET_KEY=votre-jwt-secret
DATABASE_URL=postgresql://postgres:password@localhost:5432/monity_db
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
DEBUG=True
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_DEBUG=true
```

## Utilisation de Docker

### Commandes principales

```bash
# Démarrer tous les services
docker-compose up -d

# Afficher les logs
docker-compose logs -f

# Arrêter les services
docker-compose down

# Reconstruire les images
docker-compose build --no-cache

# Exécuter une commande dans un container
docker-compose exec backend bash
```

### Accès à la base de données

```bash
# Directement via Docker
docker-compose exec postgres psql -U postgres -d monity_db

# Via une commande psql locale
psql postgresql://postgres:password@localhost:5432/monity_db
```

## Endpoints API Principaux

### Authentification
- `POST /api/auth/register` - Créer un compte
- `POST /api/auth/login` - Se connecter
- `POST /api/auth/refresh` - Rafraîchir le token
- `POST /api/auth/logout` - Se déconnecter

### Utilisateurs
- `GET /api/users/profile` - Obtenir le profil
- `PUT /api/users/profile` - Mettre à jour le profil
- `POST /api/users/change-password` - Changer le mot de passe

### Comptes
- `GET /api/accounts` - Lister les comptes
- `POST /api/accounts` - Créer un compte
- `GET /api/accounts/<id>` - Détails du compte
- `PUT /api/accounts/<id>` - Modifier le compte
- `POST /api/accounts/<id>/add-user` - Ajouter un utilisateur
- `DELETE /api/accounts/<id>` - Supprimer le compte

### Transactions
- `GET /api/transactions/account/<account_id>` - Lister les transactions
- `POST /api/transactions` - Créer une transaction
- `PUT /api/transactions/<id>` - Modifier une transaction
- `DELETE /api/transactions/<id>` - Supprimer une transaction

### Catégories
- `GET /api/categories/account/<account_id>` - Lister les catégories
- `POST /api/categories` - Créer une catégorie
- `PUT /api/categories/<id>` - Modifier une catégorie
- `DELETE /api/categories/<id>` - Supprimer une catégorie

### Budgets
- `GET /api/budgets/account/<account_id>` - Lister les budgets
- `POST /api/budgets` - Créer un budget
- `PUT /api/budgets/<id>` - Modifier un budget
- `DELETE /api/budgets/<id>` - Supprimer un budget

## Authentification API

Tous les endpoints (sauf `/api/auth/register` et `/api/auth/login`) requièrent un JWT token.

### Headers requis
```
Authorization: Bearer <access_token>
```

## Développement

### Tests du Backend
```bash
cd backend
python -m pytest
```

### Linting et Formatage
```bash
# Backend
cd backend
flake8 .
black .

# Frontend
cd frontend
npm run lint
npm run format
```

### Build pour la Production

#### Frontend
```bash
cd frontend
npm run build
# Les fichiers seront dans dist/
```

#### Backend
```bash
# Utiliser Docker
docker build -t monity-backend ./backend
```

## Dépannage

### Erreur de connexion à PostgreSQL
1. Vérifier que PostgreSQL est en cours d'exécution
2. Vérifier la DATABASE_URL dans .env
3. Vérier les permissions de l'utilisateur

### Erreur CORS
1. Vérifier que CORS_ORIGINS contient l'URL du frontend
2. Vérifier que le header Authorization est envoyé correctement

### Token JWT expiré
- Utiliser l'endpoint `/api/auth/refresh` pour obtenir un nouveau token
- Le token de refresh a une durée de 30 jours

## Prochaines Étapes

1. Consulter [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) pour l'API détaillée
2. Consulter [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) pour le schéma DB
3. Consulter [ARCHITECTURE.md](./ARCHITECTURE.md) pour les principes de conception