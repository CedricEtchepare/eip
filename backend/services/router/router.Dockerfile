FROM node:18-alpine
WORKDIR /app
COPY ../../package*.json ./
RUN npm install --only=production
COPY ./services/router /app
CMD ["node", "router.js"]
