# Architecture - Monity

## Vue d'ensemble Générale

Monity est une application web fullstack de gestion de budget multi-utilisateur avec architecture classique:

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                   │
│                    Port: 5173 (Développement)                    │
│  - SPA (Single Page Application)                                │
│  - State Management (Context API / Redux optionnel)             │
│  - Composants réutilisables                                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    (HTTP/HTTPS)
                    (REST API)
                           │
┌──────────────────────────┴──────────────────────────────────────┐
│                    API GATEWAY / CORS                            │
│                  (Flask-CORS middleware)                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────────┐
│                   BACKEND (Flask + SQLAlchemy)                   │
│                    Port: 5000 (Développement)                    │
│  - RESTful API avec Blueprint pattern                           │
│  - Authentication (JWT)                                         │
│  - Business Logic                                               │
│  - Database Layer                                               │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                      (SQL)
                           │
┌──────────────────────────┴──────────────────────────────────────┐
│                   BASE DE DONNÉES                                │
│                 (PostgreSQL + SQLAlchemy ORM)                   │
│                    Port: 5432                                    │
│  - Schéma relationnel normalized                                │
│  - Support multi-utilisateur et comptes partagés                │
└─────────────────────────────────────────────────────────────────┘
```

## Architecture du Frontend (React + Vite)

### Structure Recommandée
```
frontend/src/
├── assets/               # Images, fonts, etc.
├── components/           # Composants réutilisables
│   ├── Auth/
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   └── ProtectedRoute.jsx
│   ├── Accounts/
│   │   ├── AccountList.jsx
│   │   ├── AccountForm.jsx
│   │   └── AccountSelector.jsx
│   ├── Transactions/
│   │   ├── TransactionList.jsx
│   │   ├── TransactionForm.jsx
│   │   └── TransactionCard.jsx
│   ├── Common/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── Modal.jsx
│   └── Dashboard/
│       ├── BudgetChart.jsx
│       ├── SpendingChart.jsx
│       └── Summary.jsx
├── pages/                # Pages principales (routing)
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── Accounts.jsx
│   ├── Transactions.jsx
│   └── Settings.jsx
├── services/             # API calls
│   ├── api.js           # Axios instance + interceptors
│   ├── authService.js
│   ├── accountService.js
│   ├── transactionService.js
│   ├── categoryService.js
│   └── budgetService.js
├── hooks/                # Custom React hooks
│   ├── useAuth.js
│   ├── useAccount.js
│   ├── useTransactions.js
│   └── useFetch.js
├── context/              # Context API for state
│   ├── AuthContext.jsx
│   ├── AccountContext.jsx
│   └── NotificationContext.jsx
├── utils/                # Helper functions
│   ├── formatters.js     # Format dates, currency
│   ├── validators.js     # Form validation
│   ├── constants.js      # Constants et enums
│   └── localStorage.js   # Storage helpers
├── App.jsx               # Main component
├── main.jsx              # Entry point
└── index.css             # Global styles
```

### Principes de Design React

1. **Component Composition:**
   - Petits composants fonctionnels
   - Réutilisation via props
   - Props drilling minimal

2. **State Management:**
   - Context API pour state global (auth, notifications)
   - useState pour state local
   - useReducer pour state complexe

3. **API Communication:**
   - Axios comme HTTP client
   - Interceptors pour JWT tokens
   - Error handling centralisé
   - Loading states

4. **Performance:**
   - Code splitting via React.lazy()
   - Memoization avec useMemo/useCallback
   - Image optimization
   - Bundle size monitoring

## Architecture du Backend (Flask)

### Structure
```
backend/
├── config.py            # Configuration (development, production, testing)
├── models.py            # SQLAlchemy models
├── app.py               # Application factory
├── routes/              # API endpoints (blueprints)
│   ├── auth.py         # Authentication
│   ├── users.py        # User management
│   ├── accounts.py     # Account management
│   ├── transactions.py # Transaction CRUD
│   ├── categories.py   # Category management
│   └── budgets.py      # Budget management
├── requirements.txt
├── .env.example
├── Dockerfile
└── .gitignore
```

### Principes Architecturaux

#### 1. Application Factory Pattern
```python
def create_app(config_name=None):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    # Initialize extensions
    # Register blueprints
    # Create tables
    return app
```

**Avantages:**
- Flexibilité dans les configurations
- Facilité de testing
- Separ des préoccupations

#### 2. Blueprint Pattern
Chaque domaine (auth, accounts, etc.) est un blueprint séparé.

```python
# routes/accounts.py
accounts_bp = Blueprint('accounts', __name__)

@accounts_bp.route('', methods=['GET'])
@jwt_required()
def get_accounts():
    # Implementation
```

**Avantages:**
- Modularité
- Maintenance facile
- Scalabilité

#### 3. JWT Authentication
- **Access Token:** JWT court terme (24h)
- **Refresh Token:** Token long terme (30j)
- Gestion centralisée via `@jwt_required()`

```python
@accounts_bp.route('/<id>', methods=['GET'])
@jwt_required()
def get_account(id):
    user_id = get_jwt_identity()
    # Vérifier l'accès
    # Retourner les données
```

#### 4. Access Control
Systématique pour chaque opération:

```python
def get_account(account_id):
    user_id = get_jwt_identity()
    account = Account.query.get(account_id)
    
    # Vérifier l'accès
    if not any(owner.id == user_id for owner in account.owners):
        return {'error': 'Access denied'}, 403
    
    return account.to_dict()
```

#### 5. Séparation des Couches

**Route Layer:** Gère les requêtes HTTP
```python
@accounts_bp.route('/<id>', methods=['PUT'])
@jwt_required()
def update_account(id):
    # Validation
    # Appel du modèle
    # Réponse HTTP
```

**Model Layer:** Gère la logique métier et persistence
```python
class Account(db.Model):
    def to_dict(self):
        # Exposure contrôlée des données
```

**Database Layer:** Abstraction via SQLAlchemy ORM

## Principes SOLID Appliqués

### 1. Single Responsibility Principle (SRP)
- **Frontend:** Chaque composant a UNE seule responsabilité
- **Backend:** Chaque route gère UN seul domaine métier

```python
# ✓ Bon - Routes séparées par domaine
accounts_bp = Blueprint('accounts', __name__)
transactions_bp = Blueprint('transactions', __name__)

# ✗ Mauvais - Routes mixtes
api_bp = Blueprint('api', __name__)
```

### 2. Open/Closed Principle (OCP)
- **Extensible** pour nouveaux types de comptes
- **Fermé** pour modifications

```python
# Extensible pour nouveaux types de comptes
type = db.Column(db.String(20))  # 'personal', 'shared', 'business'

# Fermé - les opérations CRUD restent identiques
```

### 3. Liskov Substitution Principle (LSP)
- Les modèles SQLAlchemy substituables
- Les blueprints interchangeables

### 4. Interface Segregation Principle (ISP)
- Routes séparées par domaine (pas un mega route)
- Méthodes to_dict() pour contrôler l'exposition

```python
def to_dict(self, include_users=False):
    # Expose seulement ce qui est nécessaire
```

### 5. Dependency Inversion Principle (DIP)
- Dépendre des abstractions, pas des implémentations
- SQLAlchemy abstrait la BD
- Blueprints découplent les routes

## Flux de Données

### Authentification
```
1. Frontend: POST /api/auth/login {email, password}
2. Backend: Hash password, compare, générer JWT
3. Backend: Retourner {access_token, refresh_token}
4. Frontend: Stocker tokens (localStorage/sessionStorage)
5. Frontend: Inclure Authorization header dans requêtes
```

### Création de Transaction
```
1. Frontend: Collecte données du formulaire
2. Frontend: POST /api/transactions {amount, type, date, ...}
3. Backend: Valider l'accès au compte
4. Backend: Créer transaction, mettre à jour balance
5. Backend: Retourner la transaction créée
6. Frontend: Mettre à jour l'affichage (optimistic update ou refetch)
```

### Partage de Compte (Couple)
```
1. User A: POST /api/accounts {name: "Compte Commun", type: "shared"}
2. Backend: Créer compte, ajouter User A comme owner
3. User A: POST /api/accounts/{id}/add-user {email: "userB@..."}
4. Backend: Ajouter User B comme member/owner
5. User B: Voir le compte dans GET /api/accounts
6. User B: Peut créer/modifier transactions
7. Sécurité: Vérifier l'accès avant chaque opération
```

## Sécurité

### Frontend
- **HTTPS:** Obligatoire en production
- **Storage:** Tokens en memory + secure cookies
- **CORS:** Vérifié par le serveur

### Backend
- **HTTPS:** Obligatoire en production
- **JWT:** Tokens signés, expirant
- **CORS:** Configurable par env
- **Access Control:** Systématique
- **Password:** Hashé avec bcrypt
- **Input Validation:** À chaque opération
- **SQL Injection:** Protégé par ORM SQLAlchemy
- **Rate Limiting:** Peut être ajouté avec Flask-Limiter

## Performance

### Frontend
- **Code Splitting:** Routes avec React.lazy()
- **Lazy Loading:** Images, composants
- **Memoization:** useMemo, useCallback, React.memo
- **Bundle Size:** Monitoring avec vite-plugin-visualizer

### Backend
- **Pagination:** Transactions paginées (20/page)
- **Indexes:** Sur account_id, date, user_id
- **Caching:** Peut être ajouté avec Flask-Caching
- **Query Optimization:** N+1 query prevention
- **Connection Pooling:** Via SQLAlchemy

## Déploiement

### Frontend
- Build: `npm run build`
- Output: `dist/`
- Hosting: Vercel, Netlify, AWS S3, etc.

### Backend
- Docker: `docker build -t monity-backend ./backend`
- Hosting: Heroku, AWS EC2, DigitalOcean, etc.
- Database: AWS RDS, Azure Database, etc.

## Monitoring et Logging

À implémenter:
- **Frontend:** Sentry, LogRocket
- **Backend:** Logging structuré, Sentry
- **Database:** Monitoring des requêtes lentes
- **APM:** Application Performance Monitoring

## Points d'Extensibilité

1. **Nouveaux types de comptes:** Ajouter type dans Enum
2. **Nouvelles permissions:** Ajouter role dans user_accounts
3. **Notifications:** Ajouter table notifications
4. **Audit Trail:** Ajouter table audit_logs
5. **Two-Factor Auth:** Service externe + tokens supplémentaires
6. **Webhooks:** Pour intégrations tierces