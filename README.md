# Monity - Gestion de Budget Multi-Utilisateur

Une application web fullstack moderne pour gérer les budgets personnels et partagés avec support multi-utilisateur.

## 🎯 Fonctionnalités

### Gestion des Comptes
- ✅ Comptes personnels (privés)
- ✅ Comptes partagés (famille, couple, colocation)
- ✅ Gestion des permissions (owner/member)
- ✅ Support multi-devises
- ✅ Suivi du solde en temps réel

### Gestion des Transactions
- ✅ Ajouter/modifier/supprimer transactions
- ✅ Catégorisation automatique
- ✅ Support des transactions récurrentes
- ✅ Tags et notes pour plus de flexibilité
- ✅ Pagination et filtrage
- ✅ Historique complet

### Budgets et Alertes
- ✅ Budgets par catégorie
- ✅ Budgets globaux
- ✅ Seuils d'alerte configurables
- ✅ Périodes flexibles (mensuel, annuel)

### Sécurité & Confidentialité
- ✅ Authentification JWT
- ✅ Hashage des mots de passe (bcrypt)
- ✅ Vérification des permissions systématique
- ✅ Isolation des données par compte
- ✅ CORS configuré

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 18+ avec Vite
- Context API pour state management
- Axios pour API calls
- Responsive design

**Backend:**
- Flask 3.0+
- SQLAlchemy ORM
- PostgreSQL 15+
- JWT authentication

**DevOps:**
- Docker & Docker Compose
- PostgreSQL containerisé

## 📋 Prérequis

- Node.js 18+
- Python 3.11+
- PostgreSQL 15+ (ou Docker Desktop)
- Git

## 🚀 Démarrage Rapide

### Avec Docker (Recommandé)

```bash
# Cloner le projet
git clone <repo_url>
cd Monity

# Démarrer les services
docker-compose up -d

# Backend sera sur http://localhost:5000
# Frontend démarrer manuellement (voir ci-dessous)
```

### Sans Docker

#### Backend
```bash
cd backend

# Créer l'environnement virtuel
python -m venv venv

# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos paramètres

# Démarrer le serveur
python app.py
```

#### Frontend
```bash
cd frontend

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

## 📚 Documentation

- **[GETTING_STARTED.md](./docs/GETTING_STARTED.md)** - Guide d'installation détaillé
- **[DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md)** - Schéma et design de la BD
- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - Architecture technique et principes SOLID

## 🔑 Endpoints API Principaux

### Authentification
```
POST   /api/auth/register      - Créer un compte
POST   /api/auth/login         - Se connecter
POST   /api/auth/refresh       - Rafraîchir le token
POST   /api/auth/logout        - Se déconnecter
```

### Comptes
```
GET    /api/accounts           - Lister vos comptes
POST   /api/accounts           - Créer un compte
GET    /api/accounts/<id>      - Détails du compte
PUT    /api/accounts/<id>      - Modifier le compte
POST   /api/accounts/<id>/add-user  - Ajouter un utilisateur
DELETE /api/accounts/<id>      - Supprimer le compte
```

### Transactions
```
GET    /api/transactions/account/<account_id>  - Lister les transactions
POST   /api/transactions       - Créer une transaction
PUT    /api/transactions/<id>  - Modifier une transaction
DELETE /api/transactions/<id>  - Supprimer une transaction
```

### Catégories
```
GET    /api/categories/account/<account_id>  - Lister les catégories
POST   /api/categories        - Créer une catégorie
PUT    /api/categories/<id>   - Modifier
DELETE /api/categories/<id>   - Supprimer
```

### Budgets
```
GET    /api/budgets/account/<account_id>  - Lister les budgets
POST   /api/budgets           - Créer un budget
PUT    /api/budgets/<id>      - Modifier
DELETE /api/budgets/<id>      - Supprimer
```

## 🗄️ Schéma de Données

### Modèles Principaux

**Users**
- Authentification et profil utilisateur
- Relations many-to-many avec Accounts

**Accounts**
- Type: personal (privé) ou shared (partagé)
- Support multi-devises
- Solde en temps réel

**Transactions**
- Liées à un compte
- Optionnellement à une catégorie
- Support des récurrence
- Traçabilité (qui a créé)

**Budgets**
- Par catégorie ou global
- Périodes flexibles
- Seuils d'alerte

**Categories**
- Liées à un compte
- Customisables par compte
- Peuvent être income ou expense

## 🔒 Sécurité

### Frontend
- HTTPS obligatoire en production
- Tokens en sessionStorage
- Validation des formulaires

### Backend
- JWT tokens (access + refresh)
- Mots de passe hashés (bcrypt)
- Vérification des permissions systématique
- Input validation
- CORS configuré
- SQL injection protection via ORM

## 📊 Structure du Projet

```
Monity/
├── frontend/          # React + Vite
├── backend/           # Flask + SQLAlchemy
├── docs/              # Documentation
├── docker-compose.yml # Services
.env-example          # Template env
└── README.md
```

## 🛠️ Développement

### Variables d'Environnement

#### Backend (.env)
```env
FLASK_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/monity_db
JWT_SECRET_KEY=your-secret-key
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

### Scripts Utiles

```bash
# Backend
python app.py              # Démarrer le serveur
python -m pytest          # Tests unitaires

# Frontend
npm run dev               # Serveur de développement
npm run build            # Production build
npm run lint             # Linting
```

## 🚢 Déploiement

### Frontend
```bash
npm run build
# Déployer le dossier dist/
```

### Backend
```bash
# Docker
docker build -t monity-backend ./backend
docker run -p 5000:5000 monity-backend

# Ou sur Heroku, AWS, etc.
```

## 📈 Principes Appliqués

### SOLID Principles
- **S**ingle Responsibility: Chaque composant/module a une seule responsabilité
- **O**pen/Closed: Code extensible pour nouveaux types de comptes/rôles
- **L**iskov Substitution: Modèles interchangeables
- **I**nterface Segregation: Routes séparées par domaine
- **D**ependency Inversion: Abstractions via SQLAlchemy et Blueprints

### Best Practices
- Component composition (React)
- Blueprint pattern (Flask)
- Application factory pattern
- JWT authentication
- Systematic access control
- Database indexing
- Pagination for performance

## 📞 Support et Contribution

Pour toute question ou bug, veuillez ouvrir une issue sur GitHub.

## 📄 License

MIT License - voir LICENSE.md

## 🎓 Apprentissage

Ce projet a été structuré expliquant/démontrant:
- Architecture fullstack moderne
- Principes SOLID
- Best practices React
- Best practices Python/Flask
- Design de base de données multi-utilisateur
- Sécurité et authentification
- Docker et containerization

---

**Dernière mise à jour:** Mars 2026