FROM node:18-alpine
WORKDIR /app
COPY ../../package*.json ./
RUN npm install --only=production
COPY ./services/producer /app
COPY ../../websocket.js /app/websocket.js
EXPOSE 9000
CMD ["node", "producer.js"]