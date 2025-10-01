# Instructions pour l'Atelier IA Générative

## 🎯 Objectifs de l'atelier

Cet atelier démontre comment utiliser l'IA générative pour développer un logiciel complet en respectant les standards de l'industrie.

## 📋 Prérequis

### Logiciels à installer
1. **VSCode** : https://code.visualstudio.com/download
2. **Python 3.12+** : https://www.python.org/downloads/
3. **Node.js** : https://nodejs.org/fr/download/package-manager
4. **Git avec Git Bash** : https://git-scm.com/download/win
5. **Poetry** : https://python-poetry.org/docs/#installing-with-the-official-installer
6. **UV** : https://docs.astral.sh/uv/getting-started/installation/
7. **Ollama** : https://ollama.com/download/windows

### Modèles Ollama à télécharger
```bash
ollama run deepseek-coder:6.7b
ollama run nomic-embed-text
```

### Extension VSCode
- **Continue.dev** : Installer depuis le marketplace VSCode

## 🚀 Démarrage rapide

### Option 1 : Script automatique
```bash
# Windows (PowerShell)
.\start.ps1

# Windows (CMD)
start.bat
```

### Option 2 : Manuel
```bash
# Démarrer les services
docker-compose up --build

# Accéder aux applications
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# Documentation API: http://localhost:8000/docs
```

## 🛠️ Utilisation de Continue.dev

### Configuration
Le fichier `.continue/config.json` est déjà configuré avec :
- **deepseek-coder:6.7b** pour l'autocomplétion et l'édition
- **nomic-embed-text** pour l'embedding et la recherche

### Commandes utiles
- `Ctrl+L` : Ouvrir le chat Continue
- `Ctrl+I` : Invite rapide
- `Ctrl+K` : Édition rapide

### Exemples de prompts
```
"Écris un endpoint FastAPI pour récupérer tous les utilisateurs"
"Modifie le composant React pour ajouter un champ de recherche"
"Crée un modèle SQLAlchemy pour une table de produits"
```

## 📁 Structure du projet

```
projet_vscode/
├── vite-project/          # Frontend React + TypeScript + Vite
│   ├── src/
│   │   └── App.tsx       # Composant principal avec intégration API
│   └── Dockerfile
├── back-fastapi/          # Backend FastAPI + Python
│   ├── app/
│   │   ├── main.py       # Application FastAPI principale
│   │   └── models/       # Modèles SQLAlchemy
│   └── Dockerfile
├── docker-compose.yml     # Orchestration des services
├── .continue/            # Configuration Continue.dev
└── README.md
```

## 🔧 Fonctionnalités implémentées

### Frontend (React)
- Interface utilisateur avec compteur
- Appels API vers le backend
- Gestion des états de chargement
- Types TypeScript pour la sécurité

### Backend (FastAPI)
- API REST avec documentation automatique
- Modèles SQLAlchemy pour la base de données
- Endpoints GET/POST pour le compteur
- Configuration CORS pour le frontend

### Base de données (PostgreSQL)
- Table `count_table` avec champ `count_number`
- Initialisation automatique avec valeur 0
- Persistance des données

## 🎓 Exercices pratiques

### Niveau débutant
1. Modifier le texte affiché dans l'interface React
2. Changer la couleur du bouton
3. Ajouter un message de confirmation

### Niveau intermédiaire
1. Créer un endpoint pour réinitialiser le compteur
2. Ajouter la validation des données avec Pydantic
3. Implémenter la gestion d'erreurs dans React

### Niveau avancé
1. Ajouter l'authentification JWT
2. Créer un système de logs
3. Implémenter des tests unitaires

## 🐛 Dépannage

### Problèmes courants
- **Port déjà utilisé** : Changer les ports dans docker-compose.yml
- **Ollama non accessible** : Vérifier que le service Ollama est démarré
- **Erreurs CORS** : Vérifier la configuration dans main.py

### Logs utiles
```bash
# Logs Docker Compose
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 📚 Ressources

- [Documentation Continue.dev](https://docs.continue.dev/quickstart)
- [Documentation FastAPI](https://fastapi.tiangolo.com/)
- [Documentation React](https://react.dev/)
- [Documentation Vite](https://vitejs.dev/)

## 👨‍🏫 Contact

**Nicolas Debeissat**  
Email: nicolas.debeissat@mail-formateur.net

---

*Atelier développé dans le cadre de la formation "Coder avec une IA générative"*