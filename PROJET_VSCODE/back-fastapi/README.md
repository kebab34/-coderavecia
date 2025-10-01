# Backend FastAPI

Backend FastAPI pour l'atelier de codage avec l'IA générative.

## Installation

```bash
pip install -r requirements.txt
```

## Lancement

```bash
uvicorn app.main:app --reload
```

## Endpoints

- GET /count - Récupère la valeur actuelle du compteur
- POST /count/increment - Incrémente le compteur de 1
