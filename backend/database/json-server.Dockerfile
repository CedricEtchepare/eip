FROM node:18-alpine
WORKDIR /app

# Installer json-server
RUN npm install -g json-server

# Définir le point d'entrée
CMD ["json-server", "--watch", "/data/db.json", "--host", "0.0.0.0", "--port", "3005"]
