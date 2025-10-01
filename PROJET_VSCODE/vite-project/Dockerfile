FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le code source
COPY . .

# Donner les permissions d'exécution à node_modules
RUN chmod -R +x node_modules/.bin/

# Exposer le port
EXPOSE 5173

# Commande pour démarrer l'application en mode développement
CMD ["npm", "run", "dev", "--", "--host"]
