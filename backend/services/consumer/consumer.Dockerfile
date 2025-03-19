FROM node:18-alpine
WORKDIR /app
COPY ../../package*.json ./
RUN npm install --only=production
COPY ./services/consumer /app
COPY ../../websocket.js /app/websocket.js
CMD ["node", "consumer.js"]
