# Atelier : Coder avec une IA générative

Ce projet démontre l'utilisation de Large Language Models pour développer un logiciel en respectant les standards de l'industrie.

## Architecture

- **Frontend** : React + TypeScript + Vite
- **Backend** : FastAPI + Python
- **Base de données** : PostgreSQL
- **IA** : Ollama avec deepseek-coder:6.7b et nomic-embed-text
- **Extension** : Continue.dev pour VSCode

## Prérequis

- VSCode avec l'extension Continue.dev
- Ollama installé avec les modèles :
  - `deepseek-coder:6.7b`
  - `nomic-embed-text`
- Docker et Docker Compose
- Node.js et npm
- Python 3.12+

## Installation

1. Cloner le projet
2. Installer Ollama et télécharger les modèles :
   ```bash
   ollama run deepseek-coder:6.7b
   ollama run nomic-embed-text
   ```
3. Installer l'extension Continue.dev dans VSCode
4. Configurer Continue.dev avec le fichier `.continue/config.json`

## Lancement

### Avec Docker Compose (recommandé)
```bash
docker-compose up --build
```

### Manuellement
1. Démarrer PostgreSQL
2. Démarrer le backend FastAPI :
   ```bash
   cd back-fastapi
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```
3. Démarrer le frontend React :
   ```bash
   cd vite-project
   npm install
   npm run dev
   ```

## Fonctionnalités

- Interface React avec un compteur
- API FastAPI avec endpoints GET/POST
- Base de données PostgreSQL pour la persistance
- Intégration Continue.dev pour l'assistance IA
- Configuration Ollama pour les modèles locaux

## Endpoints API

- `GET /count` - Récupère la valeur actuelle du compteur
- `POST /count/increment` - Incrémente le compteur de 1

## Utilisation de Continue.dev

1. Ouvrir VSCode dans le répertoire du projet
2. Utiliser `Ctrl+L` pour ouvrir le chat Continue
3. Demander des modifications de code en français
4. Utiliser les contextes pour inclure des fichiers spécifiques

## Auteur

Nicolas Debeissat - nicolas.debeissat@mail-formateur.net