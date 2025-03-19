const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

let clients = [];

// Connexion WebSocket
wss.on("connection", (ws) => {
    clients.push(ws);
    ws.on("close", () => {
        clients = clients.filter(client => client !== ws);
    });
});

// Endpoint pour recevoir des logs depuis les services
app.post("/log", (req, res) => {
    const logMessage = req.body.message;
    console.log("Log reçu :", logMessage);
    
    // Envoyer le log à tous les clients WebSocket
    clients.forEach(client => client.send(logMessage));
    
    res.status(200).send("Log envoyé");
});

const PORT = 4000;
server.listen(PORT, () => console.log("Serveur WebSocket en écoute sur http:localhost:${PORT}"));