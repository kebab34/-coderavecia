# Atelier IA Générative - Application Compteur

Application web fullstack moderne développée pour l'atelier IA générative avec un backend FastAPI, un frontend React/Vite et une base de données PostgreSQL.

## Description

Cette application propose un compteur interactif avec de nombreuses fonctionnalités :
- Incrémentation/décrémentation du compteur
- Modification personnalisée (valeurs positives ou négatives)
- Historique complet des actions
- Visualisations graphiques (ligne, barres, camembert, donut)
- Mode jeu avec timer
- Export des données (JSON, CSV)
- Mode sombre/clair
- Animations et confettis

## Architecture

```
projet_vscode/
├── backend-fastapi/       # API FastAPI + SQLAlchemy
├── vite-project/          # Frontend React + TypeScript + Vite
└── docker-compose.yml     # Orchestration des services
```

### Stack Technique

**Backend:**
- FastAPI
- SQLAlchemy (ORM)
- PostgreSQL
- Pydantic (validation)
- Poetry (gestion des dépendances)

**Frontend:**
- React 19
- TypeScript
- Vite
- Chart.js & react-chartjs-2 (graphiques)
- Framer Motion (animations)
- React Hot Toast (notifications)
- React Confetti (effets visuels)

**Infrastructure:**
- Docker & Docker Compose
- PostgreSQL

## Prérequis

- Docker
- Docker Compose

Aucune autre installation nécessaire, tout est conteneurisé.

## Installation et Démarrage

### Démarrage avec Docker Compose

```bash
# Cloner le repository
cd projet_vscode

# Lancer tous les services
docker-compose up --build

# Ou en mode détaché
docker-compose up -d --build
```

L'application sera accessible sur :
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Documentation API**: http://localhost:8000/docs
- **PostgreSQL**: localhost:5433

### Arrêter les services

```bash
# Arrêter les containers
docker-compose down

# Arrêter et supprimer les volumes (données)
docker-compose down -v
```

## Développement Local

### Backend (FastAPI)

```bash
cd back-fastapi

# Installation avec Poetry
poetry install

# Activer l'environnement virtuel
poetry shell

# Lancer le serveur de développement
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend (React + Vite)

```bash
cd vite-project

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Build de production
npm run build

# Preview du build
npm run preview
```

## API Endpoints

### Compteur
- `GET /` - Message de bienvenue
- `GET /count` - Récupérer la valeur actuelle
- `POST /count/increment` - Incrémenter de 1
- `POST /count/decrement` - Décrémenter de 1
- `POST /count/custom` - Modifier avec une valeur personnalisée
- `POST /count/reset` - Réinitialiser à 0
- `GET /count/history` - Récupérer l'historique complet

### Documentation
- `GET /docs` - Swagger UI interactif
- `GET /redoc` - Documentation ReDoc

## Fonctionnalités

### Compteur Principal
- Incrémentation/décrémentation unitaire
- Modification personnalisée (toute valeur positive ou négative)
- Réinitialisation
- Persistance en base de données PostgreSQL

### Visualisations
- **Graphiques** : Ligne, Barres, Camembert, Donut
- **Statistiques** : Total d'actions, Incréments, Décréments, Resets
- **Historique** : Toutes les actions avec horodatage

### Export de Données
- Export JSON (compteur + historique + stats)
- Export CSV (historique complet)

### Mode Jeu
- Jeu de clics rapides sur 30 secondes
- Score et timer en temps réel
- Confettis pour les bons scores

### Interface
- Mode sombre/clair
- Animations fluides avec Framer Motion
- Notifications toast
- Confettis pour les paliers (multiples de 10)
- Design responsive

## Base de Données

### Schéma

**Table `count_table`:**
- `id`: Identifiant unique
- `count_number`: Valeur actuelle du compteur

**Table `count_history`:**
- `id`: Identifiant unique
- `count_value`: Valeur du compteur au moment de l'action
- `action`: Type d'action (increment, decrement, reset, etc.)
- `timestamp`: Date et heure de l'action

## Configuration

### Variables d'environnement

**Backend:**
- `DATABASE_URL`: URL de connexion PostgreSQL (défaut: `postgresql://postgres:password@db:5432/atelier_db`)

**PostgreSQL:**
- `POSTGRES_DB`: Nom de la base (défaut: `atelier_db`)
- `POSTGRES_USER`: Utilisateur (défaut: `postgres`)
- `POSTGRES_PASSWORD`: Mot de passe (défaut: `password`)

## Structure du Code

### Backend (`back-fastapi/`)
```
back-fastapi/
├── app/
│   ├── __init__.py
│   ├── main.py              # Point d'entrée FastAPI
│   └── models/
│       ├── __init__.py
│       └── count_table.py   # Modèles SQLAlchemy
├── Dockerfile
├── pyproject.toml           # Configuration Poetry
└── poetry.toml
```

### Frontend (`vite-project/`)
```
vite-project/
├── src/
│   ├── App.tsx              # Composant principal
│   ├── App.css              # Styles
│   ├── main.tsx             # Point d'entrée
│   └── index.css            # Styles globaux
├── public/
├── Dockerfile
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Scripts Utiles

```bash
# Voir les logs en temps réel
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Reconstruire un service
docker-compose up -d --build backend

# Accéder au shell d'un container
docker-compose exec backend bash
docker-compose exec db psql -U postgres -d atelier_db
```

## Dépannage

### Le frontend ne se connecte pas au backend
- Vérifier que le backend est bien accessible sur http://localhost:8000
- Vérifier les logs : `docker-compose logs backend`

### Erreur de connexion à PostgreSQL
- Attendre que PostgreSQL soit complètement démarré (healthcheck)
- Vérifier les logs : `docker-compose logs db`

### Port déjà utilisé
- Modifier les ports dans `docker-compose.yml` si 5173, 8000 ou 5433 sont déjà utilisés

## Auteur

Projet développé dans le cadre de l'atelier IA générative à EPSI.

## Licence

Ce projet est à usage éducatif.
