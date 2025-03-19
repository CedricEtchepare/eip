FROM node:18-alpine
WORKDIR /app
COPY ../../package*.json ./
RUN npm install --only=production
COPY ./services/enricher /app
CMD ["node", "enricher.js"]
