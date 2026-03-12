# Guide d'Installation Docker et Lancement du Projet Monity

Ce guide vous explique comment installer Docker sur Windows et lancer le projet complet avec la base de données en mode développement.

## ÉTAPE 1: Installer Docker Desktop sur Windows

### Prérequis
- Windows 10 Pro, Enterprise, ou Education (ou Windows 11)
- Au minimum 8 GB de RAM
- Hyper-V activé (généralement activé par défaut sur les versions Pro+)

### Procédure d'Installation

1. **Télécharger Docker Desktop**
   - Allez sur https://www.docker.com/products/docker-desktop
   - Cliquez sur "Download for Windows"
   - Choisissez le fichier approprié pour votre architecture (Intel ou Apple Silicon si applicable)

2. **Installer Docker Desktop**
   - Double-cliquez sur `Docker Desktop Installer.exe`
   - Suivez l'assistant d'installation
   - Acceptez les conditions d'utilisation
   - L'installation peut prendre quelques minutes

3. **Configuration Initiale**
   - Après l'installation, Docker démarre automatiquement
   - Une fenêtre Docker Desktop s'ouvre
   - Attendez que Docker soit complètement démarré (vous verrez un message "Docker is running")
   - Cela peut prendre 1-2 minutes

4. **Vérifier l'Installation**
   - Ouvrez PowerShell ou Command Prompt (cmd)
   - Exécutez la commande:
     ```
     docker --version
     ```
   - Vous devriez voir quelque chose comme: `Docker version 24.0.0, build ...`

5. **Activer WSL 2 (optionnel mais recommandé)**
   - Docker Desktop sur Windows utilise WSL 2 (Windows Subsystem for Linux)
   - Si vous avez des messages d'erreur, visitez: https://docs.microsoft.com/en-us/windows/wsl/install

---

## ÉTAPE 2: Préparer le Projet

Une fois Docker installé et en cours d'exécution, suivez ces étapes:

### 1. Créer les fichiers .env

#### Pour le Backend:
Depuis la racine du projet, créez `backend/.env` avec le contenu suivant:

```
FLASK_ENV=development
FLASK_APP=app.py
SECRET_KEY=dev-secret-key-change-in-production
JWT_SECRET_KEY=dev-jwt-secret-key-change-in-production
DATABASE_URL=postgresql://postgres:password@postgres:5432/monity_db
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
DEBUG=True
```

#### Pour le Frontend:
Le fichier `frontend/.env.local` devrait contenir:

```
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_key
```

---

## ÉTAPE 3: Lancer le Projet avec Docker

### Option A: Lancer uniquement Backend + Base de Données (Recommandé pour débuter)

1. Ouvrez PowerShell ou Command Prompt
2. Naviguez vers le dossier du projet:
   ```
   cd c:\Users\Samue\Desktop\project\Monity
   ```

3. Démarrez les services Docker:
   ```
   docker-compose up
   ```

   Vous devriez voir:
   - PostgreSQL se démarrer
   - Le backend Flask se démarrer en mode développement
   - Les logs s'affichant dans la console

4. Le système est prêt quand vous voyez:
   - `postgres_1  | database system is ready to accept connections`
   - `backend_1   | Running on http://0.0.0.0:5000`

5. Vérifiez que le backend fonctionne:
   - Ouvrez http://localhost:5000 dans votre navigateur
   - Ou utilisez curl:
     ```
     curl http://localhost:5000
     ```

### Option B: Lancer Backend + Base de Données en arrière-plan

Pour laisser les services tourner en arrière-plan et continuer à utiliser le terminal:

```
docker-compose up -d
```

Pour voir les logs:
```
docker-compose logs -f
```

Pour arrêter les services:
```
docker-compose down
```

---

## ÉTAPE 4: Lancer le Frontend (en parallèle)

**Important:** Le frontend peut tourner directement avec Node.js (pas besoin de Docker pour le développement)

1. Ouvrez un **nouvel** onglet PowerShell/Command Prompt
2. Allez dans le dossier frontend:
   ```
   cd c:\Users\Samue\Desktop\project\Monity\frontend
   ```

3. Installez les dépendances (première fois seulement):
   ```
   npm install
   ```

4. Démarrez le serveur de développement:
   ```
   npm run dev
   ```

5. Le frontend sera accessible sur http://localhost:5173

---

## ÉTAPE 5: Vérifier que Tout Fonctionne

### Vérifier les services Docker:
```
docker ps
```

Vous devriez voir 2 conteneurs actifs:
- `monity_postgres` (la base de données)
- `monity_backend` (l'API Flask)

### Vérifier la base de données:
```
docker-compose exec postgres psql -U postgres -d monity_db -c "\dt"
```

### Consulter les logs:
```
docker-compose logs backend
docker-compose logs postgres
```

---

## ÉTAPE 6: Accéder à l'Application

Une fois tout démarré:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Base de Données:** localhost:5432 (PostgreSQL)

---

## Commandes Utiles Docker

### Démarrer les services
```
docker-compose up
```

### Arrêter les services
```
docker-compose down
```

### Arrêter et supprimer les volumes (réinitialiser la base de données)
```
docker-compose down -v
```

### Voir les logs en temps réel
```
docker-compose logs -f
```

### Voir les logs d'un service spécifique
```
docker-compose logs -f backend
docker-compose logs -f postgres
```

### Connexion directe à la base de données
```
docker-compose exec postgres psql -U postgres -d monity_db
```

### Reconstruire les images
```
docker-compose build
```

### Reconstruire et redémarrer
```
docker-compose up --build
```

---

## Dépannage

### "Docker is not running"
- Ouvrez Docker Desktop depuis le menu Démarrer
- Attendez que le statut passe à "Docker is running"

### "Cannot connect to the Docker daemon"
- Assurez-vous que Docker Desktop est ouvert
- Redémarrez Docker Desktop

### "Port 5432 already in use"
- Un autre processus utilise PostgreSQL
- Exécutez: `docker-compose down` pour arrêter les conteneurs existants
- Ou changez le port dans docker-compose.yml

### "Port 5000 already in use"
- Même situation que ci-dessus pour le backend

### Erreur de connexion à la base de données
- Vérifiez que PostgreSQL a bien démarré: `docker-compose logs postgres`
- Attendez quelques secondes après le démarrage avant de faire des requêtes
- Vérifiez que DATABASE_URL est correct dans backend/.env

### Les conteneurs s'arrêtent immédiatement
- Vérifiez les logs: `docker-compose logs`
- Vérifiez qu'il n'y a pas d'erreur dans les fichiers .env

---

## Support et Ressources

- Documentation Docker: https://docs.docker.com/
- Docker Compose Guide: https://docs.docker.com/compose/
- PostgreSQL Documentation: https://www.postgresql.org/docs/

---

**Notes:**
- Ne commitez pas les fichiers `.env` avec des vraies clés (ils sont déjà dans .gitignore)
- En développement, les volumes Docker permettent les hot-reload du code
- Utilisez `docker-compose down -v` régulièrement pour nettoyer les données anciennes